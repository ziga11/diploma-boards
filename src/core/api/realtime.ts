import type { SupabaseClient } from "@supabase/supabase-js";
import { getAccount } from "../utils/utils";
import { BoardStore } from "@/features/board/board-state";
import { entryEvents } from "@/features/board/entries/custom-events";
import { fieldEvents } from "@/features/board/fields/custom-events";
import type { Field, FieldHelper } from "@/features/board/fields/types";
import { cache } from "./cache";
import type { BoardCollaborator, NotificationFetchObject, ViewNotification } from "@/features/board/user-management/types";
import type { Board } from "@/features/dashboard/add-board/types";
import { notificationEvents } from "@/features/dashboard/notifications/custom-events";
import { dashboardEvents } from "@/features/dashboard/workspace/custom-events";
import { userManagementEvents } from "@/features/board/user-management/custom-events";
import type { BoardFetchObject } from "@/features/dashboard/workspace/types";
import { workspaceEvents } from "@/features/board/workspace/custom-events";
import type { Entry } from "@/features/board/entries/types";
import { automationEvents } from "@/features/board/automations/custom-events";
import type { Automation } from "@/features/board/automations/types";
import { supabase } from "./supabase";

export const CLIENT_ID = crypto.randomUUID();

let isInitialized = false;
let globalChannel: any = null;
let activeBoardChannel: any = null;
let activeBoardId: string | null = null;

export async function initGlobalRealtime(client: SupabaseClient) {
        if (isInitialized) return;

        const acc = await getAccount();
        if (!acc) return;

        globalChannel = client.channel(`account_sync_${acc.id}`);

        globalChannel
                .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'board_account_link'
                }, async (payload: { eventType: "INSERT", new: any, old: any }) => {
                        handleBoardInserted(payload.new.board_id);
                })
                .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'board'
                }, async (payload: { eventType: "UPDATE", new: Board, old: Board }) => {
                        handleBoardUpdated(payload.new);
                })
                .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'entry'
                }, async (payload: { eventType: string, new: Entry, old: Entry }) => {
                        if (payload.old.board_id == activeBoardId) return;

                        await cache.clear(`entries_${payload.old.board_id}`)
                })
                .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'field'
                }, async (payload: { eventType: string, new: Field, old: Field }) => {
                        if (payload.old.board_id == activeBoardId) return;

                        await cache.clear(`fields_${payload.old.board_id}`)
                })
                .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notification'
                }, async (payload: { eventType: "INSERT", new: ViewNotification, old: ViewNotification }) => {
                        handleNotificationInserted(payload.new);
                })
                .on('postgres_changes', {
                        event: 'DELETE',
                        schema: 'public',
                        table: 'notification'
                }, async (payload: { eventType: "DELETE", new: ViewNotification, old: ViewNotification }) => {
                        handleNotificationDeleted(payload.old.id);
                })
                .subscribe();

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
                        const { scope, eventType, data } = response.payload;

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
                                case 'board':
                                        await handleFieldRealtime(eventType, data);
                                        break;
                                case 'field_helper':
                                        await handleFieldHelperRealtime(eventType, data);
                                        break;
                                case 'board_account_link':
                                        await handleBoardCollaboratorRealtime(eventType, data, acc);
                                        break;
                        }
                })
                .subscribe();
}

export async function broadcastMutation(scope: string, eventType: string, data: any) {
        if (!activeBoardChannel) return;

        await activeBoardChannel.send({
                type: 'broadcast',
                event: "ui_mutate",
                payload: {
                        originClient: CLIENT_ID,
                        scope,
                        eventType,
                        data
                }
        });
}

async function handleBoardRealtime(eventType: string, data: Board) {
        switch (eventType) {
                case 'UPDATE':
                        window.dispatchEvent(workspaceEvents.boardTitleUpdate(data.name!));
                        break;
                case 'DELETE':
                        window.dispatchEvent(workspaceEvents.boardDeleted());
                        break;
        }
}

async function handleBoardCollaboratorRealtime(eventType: string, data: BoardCollaborator, acc: Account) {
        switch (eventType) {
                case 'INSERT':
                        BoardStore.collaborators.set(data.account_id, data);
                        window.dispatchEvent(userManagementEvents.addCollaborator(data));
                        break;
                case 'DELETE':
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
                        window.dispatchEvent(fieldEvents.realtimeAddField(data));
                        break;
                case 'UPDATE':
                        window.dispatchEvent(fieldEvents.realtimeFieldNameUpdate(data));
                        break;
                case 'UPDATE-SWAP':
                        window.dispatchEvent(fieldEvents.swapField(data));
                        break;
                case 'DELETE':
                        window.dispatchEvent(fieldEvents.realtimeRemoveField(data.id))
                        break;
        }
}

async function handleFieldHelperRealtime(eventType: string, data: FieldHelper) {
        switch (eventType) {
                case 'INSERT':
                        window.dispatchEvent(fieldEvents.realtimeAddFieldHelper(data));
                        break;
                case 'UPDATE':
                        window.dispatchEvent(fieldEvents.realtimeUpdateFieldHelper(data));
                        break;
                case 'DELETE':
                        window.dispatchEvent(fieldEvents.realtimeRemoveFieldHelper({ fieldId: data.field_id!, helperId: data.id! }))
                        break;
        }
}

async function handleEntryRealtime(eventType: string, data: any) {
        switch (eventType) {
                case 'INSERT-ROW':
                        window.dispatchEvent(entryEvents.realtimeNewRows(data.entries))
                        break;
                case "INSERT-FIELD":
                        window.dispatchEvent(entryEvents.newFieldEntries({ field: data.field, entryIds: data.entryIds }));
                        break;
                case 'UPDATE':
                        console.log("updating entry");

                        window.dispatchEvent(entryEvents.realtimeEntryChange({ entryId: data.id, value: data.value }));
                        break;
                case 'DELETE-ROWS':
                        window.dispatchEvent(entryEvents.realtimeRemoveEntries({ indices: data.indices }));
                        break;
                case 'DELETE-FIELD':
                        window.dispatchEvent(entryEvents.realtimeRemoveEntries({ fieldId: data.field_id }));
                        break;
                case 'DELETE-FIELD-HELPER':
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

async function handleNotificationInserted(data: ViewNotification) {
        window.dispatchEvent(notificationEvents.addNotification(data));
        addNotificationToCache(data);
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

        if (delBoard.is_owner) {
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
