import type { RealtimeChannel, RealtimePostgresDeletePayload, RealtimePostgresInsertPayload, SupabaseClient } from "@supabase/supabase-js";
import { getAccount } from "../utils/utils";
import { BoardStore } from "@/features/board/board-state";
import { entryEvents } from "@/features/board/entries/custom-events";
import { fieldEvents } from "@/features/board/fields/custom-events";
import type { Field, FieldOption } from "@/features/board/fields/types";
import { cache } from "./cache";
import type { BoardAccLink, InsertNotification, NotificationFetchObject, ViewNotification } from "@/features/board/user-management/types";
import type { Board } from "@/features/dashboard/add-board/types";
import { notificationEvents } from "@/features/dashboard/notifications/custom-events";
import { dashboardEvents } from "@/features/dashboard/workspace/custom-events";
import { userManagementEvents } from "@/features/board/user-management/custom-events";
import type { BoardFetchObject } from "@/features/dashboard/workspace/types";
import { workspaceEvents } from "@/features/board/workspace/custom-events";
import { automationEvents } from "@/features/board/automations/custom-events";
import type { Automation } from "@/features/board/automations/types";
import { supabase } from "./supabase";
import { PermissionId } from "../types/auth";

export const CLIENT_ID = crypto.randomUUID();

let isInitialized = false;
let globalChannel: RealtimeChannel | null = null;
let activeBoardChannel: RealtimeChannel | null = null;
let activeBoardId: string | null = null;

export async function initGlobalRealtime(client: SupabaseClient) {
        if (isInitialized) return;

        const acc = await getAccount();
        if (!acc) {
                console.log("starting global realtime --> no account");
                return;
        }

        globalChannel = client.channel(`account_sync`);

        globalChannel
                .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'board_account_link',
                }, async (payload: { eventType: "INSERT", new: any, old: any }) => {
                        console.log("board inserted");
                        handleBoardInserted(payload.new.board_id);
                })
                .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'board'
                }, async (payload: { eventType: "UPDATE", new: Board, old: Board }) => {
                        console.log("board updated");
                        handleBoardUpdated(payload.new);
                })
                .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'field',
                }, async (payload: { eventType: string, new: Field, old: Field }) => {
                        if (payload.old.board_id == activeBoardId) return;

                        await cache.clear(`fields_${payload.old.board_id}`)
                })
                .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notification',
                        filter: `to_acc_id=eq.${acc.id}`
                }, async (payload: RealtimePostgresInsertPayload<InsertNotification>) => {
                        console.log("notification inserted");
                        handleNotificationInserted(payload.new);
                })
                .on('postgres_changes', {
                        event: 'DELETE',
                        schema: 'public',
                        table: 'notification',
                        filter: `to_acc_id=eq.${acc.id}`
                }, async (payload: RealtimePostgresDeletePayload<InsertNotification>) => {
                        handleNotificationDeleted(payload.old.id!);
                })
                .subscribe((status, err) => {
                        console.log("Realtime connection status:", status);
                        if (err) {
                                console.error("Subscription Error payload:", err);
                        }
                });

        isInitialized = true;
}

export async function switchActiveBoardRealtime(client: SupabaseClient, newBoardId: string) {
        if (activeBoardId === newBoardId) return;
        const acc = await getAccount();
        if (!acc) return;

        if (activeBoardChannel) {
                await activeBoardChannel.unsubscribe();
                activeBoardChannel = null;
        }

        activeBoardId = newBoardId;

        activeBoardChannel = client.channel(`board_ui_${newBoardId}`, { config: { private: true } });

        activeBoardChannel
                .on('broadcast', { event: 'ui_mutate' }, async (response: any) => {
                        const { scope, eventType, data, originClient } = response.payload;

                        if (originClient === CLIENT_ID) return;

                        switch (scope) {
                                case 'automation':
                                        await handleAutomationRealtime(eventType, data);
                                        break;
                                case 'board':
                                        await handleBoardRealtime(eventType, data);
                                        break;
                                case 'entry':
                                        await handleEntryRealtime(eventType, data);
                                        break;
                                case 'field':
                                        await handleFieldRealtime(eventType, data);
                                        break;
                                case 'field_option':
                                        await handleFieldOptionRealtime(eventType, data);
                                        break;
                                case 'board_account_link':
                                        await handleBoardCollaboratorRealtime(eventType, data, acc);
                                        break;
                        }
                })
        activeBoardChannel.subscribe();
}

export async function broadcastMutation(scope: string, eventType: string, data: any) {
        if (!activeBoardChannel) return;

        const payload = { originClient: CLIENT_ID, scope, eventType, data };
        try {
                await activeBoardChannel.httpSend("ui_mutate", payload);
        }
        catch (err) {
                console.log(err);
        }
}

async function handleBoardRealtime(eventType: string, data: Board) {
        cache.clear(`board_${data.id}`);
        const board = await supabase.fetchBoard(data.id!);


        switch (eventType) {
                case 'UPDATE':
                        window.dispatchEvent(workspaceEvents.boardTitleUpdate(board.name!));
                        break;
                case 'DELETE':
                        if (data.deleted && board.deleted) {
                                window.dispatchEvent(workspaceEvents.boardDeleted());
                        }
                        break;
        }
}

async function handleBoardCollaboratorRealtime(eventType: string, data: BoardAccLink, acc: Account) {
        const boardCollaborators = await supabase.fetchCollaborators(data.board_id, [data.id]);
        switch (eventType) {
                case 'INSERT':
                        if (boardCollaborators.length == 0) return;

                        BoardStore.collaborators.set(data.account_id, boardCollaborators[0]);
                        window.dispatchEvent(userManagementEvents.addCollaborator(boardCollaborators[0]));
                        break;
                case 'DELETE':
                        if (boardCollaborators.length > 0) return;

                        BoardStore.collaborators.delete(data.account_id);
                        window.dispatchEvent(userManagementEvents.removeCollaborator(data.id));
                        if (acc.id == data.account_id) {
                                window.dispatchEvent(workspaceEvents.kickedFromBoard());
                        }
                        break;
        }
}

async function handleAutomationRealtime(eventType: string, data: Automation) {
        switch (eventType) {
                case 'INSERT':
                        window.dispatchEvent(automationEvents.addAutomation(data));
                        break;
                case 'DELETE':
                        window.dispatchEvent(automationEvents.removeAutomation(data.id!));
                        break;
        }
}

async function handleFieldRealtime(eventType: string, data: any) {
        switch (eventType) {
                case 'INSERT':
                        window.dispatchEvent(fieldEvents.addField(data));
                        break;
                case 'UPDATE':
                        window.dispatchEvent(fieldEvents.fieldNameUpdate(data));
                        break;
                case 'UPDATE-SWAP':
                        window.dispatchEvent(fieldEvents.realtimeSwapField(data));

                        data.styleSwap = true;
                        window.dispatchEvent(entryEvents.swapDOM(data));

                        break;
                case 'DELETE':
                        window.dispatchEvent(fieldEvents.removeField(data.id))
                        break;
        }
}

async function handleFieldOptionRealtime(eventType: string, data: FieldOption) {
        switch (eventType) {
                case 'INSERT':
                        window.dispatchEvent(fieldEvents.addFieldOption({ id: data.id!, value: data.value, fieldId: data.field_id!, accountId: data.account_id }));
                        break;
                case 'UPDATE':
                        window.dispatchEvent(fieldEvents.updateFieldOption({ id: data.id!, value: data.value, fieldId: data.field_id!, accountId: data.account_id }));
                        break;
                case 'DELETE':
                        window.dispatchEvent(fieldEvents.removeFieldOption({ id: data.id!, fieldId: data.field_id! }));
                        break;
        }
}

async function handleEntryRealtime(eventType: string, data: any) {
        switch (eventType) {
                case 'INSERT-ROW':
                        window.dispatchEvent(entryEvents.realtimeNewRows(data))
                        break;
                case "INSERT-FIELD":
                        window.dispatchEvent(entryEvents.newFieldEntries({ field: data.field, entryIds: data.entryIds }));
                        break;
                case 'UPDATE':
                        window.dispatchEvent(entryEvents.realtimeEntryChange({ entryId: data.id, value: data.value }));
                        break;
                case 'DELETE-ROWS':
                        window.dispatchEvent(entryEvents.realtimeRemoveEntries({ indices: data.indices }));
                        break;
                case 'DELETE-FIELD':
                        window.dispatchEvent(entryEvents.realtimeRemoveEntries({ fieldId: data.field_id }));
                        break;
                case 'DELETE-FIELD-OPTION':
                        window.dispatchEvent(entryEvents.entryChangeFieldValues({ fieldId: data.field_id!, value: "", oldValue: data.value }))
                        break;
        }
}

async function handleBoardInserted(boardId: string) {
        const board = await supabase.fetchBoard(boardId)

        window.dispatchEvent(dashboardEvents.addMultipleBoards({ boards: [board], type: "shared" }));
        addBoardToCache(board);
}
async function handleBoardUpdated(data: Board) {
        if (data.deleted) {
                handleBoardDeleted(data.id!);
        }
        else {
                window.dispatchEvent(dashboardEvents.updateBoard(data));
                updateBoardInCache(data);
        }
}
async function handleBoardDeleted(id: string) {
        window.dispatchEvent(dashboardEvents.removeBoard(id));
        removeBoardFromCache(id);
}

async function handleNotificationInserted(data: InsertNotification) {
        const n = await supabase.fetchNotification(data.id!);

        window.dispatchEvent(notificationEvents.addNotification(n));
        addNotificationToCache(n);
}
async function handleNotificationDeleted(id: string) {
        window.dispatchEvent(notificationEvents.removeNotification(id));
        removeNotificationFromCache(id);
}

async function addBoardToCache(board: Board) {
        let cached = await cache.get<BoardFetchObject>("boards");
        if (!cached) {
                cached = { all: [], deleted: [], shared: [], owned: [] };
        }

        cached.all.unshift(board);
        cached.shared.unshift(board);

        cache.set("boards", cached);
}

async function updateBoardInCache(board: Board) {
        const cached = await cache.get<BoardFetchObject>("boards");
        if (!cached) return;

        cached.owned = cached.owned.map(b => b.id == board.id ? board : b);
        cached.all = cached.all.map(b => b.id == board.id ? board : b);
        cached.shared = cached.shared.map(b => b.id == board.id ? board : b);

        cache.set("boards", cached);
}

async function removeBoardFromCache(id: string) {
        const cached = await cache.get<BoardFetchObject>("boards");
        if (!cached) return;

        const allIndex = cached.all.findIndex(b => b.id === id);
        if (allIndex == -1) return;

        const [delBoard] = cached.all.splice(allIndex, 1);

        const sharedIndex = cached.shared.findIndex(b => b.id === id);
        if (sharedIndex !== -1) cached.shared.splice(sharedIndex, 1);

        const ownedIndex = cached.owned.findIndex(b => b.id === id);
        if (ownedIndex !== -1) cached.owned.splice(sharedIndex, 1);

        if (delBoard.permission_id == PermissionId.Owner) {
                cached.deleted.push(delBoard);
        }

        await cache.clear(`board_${id}`);
        cache.set("boards", cached);
}

async function addNotificationToCache(notification: ViewNotification) {
        let cached = await cache.get<NotificationFetchObject>("notifications");
        if (!cached) {
                cached = { all: [], received: [], sent: [] };
        }

        cached.all.unshift(notification);
        if (notification.direction === 'received') {
                cached.received.unshift(notification);
        } else {
                cached.sent.unshift(notification);
        }

        await cache.set("notifications", cached);
}

async function removeNotificationFromCache(id: string) {
        let cached = await cache.get<NotificationFetchObject>("notifications");
        if (!cached) {
                cached = { all: [], received: [], sent: [] };
        }


        cached.all = cached.all.filter(n => n.id != id);
        cached.received = cached.received.filter(n => n.id != id);

        await cache.set("notifications", cached);
}
