import type { RealtimeChannel, RealtimePostgresDeletePayload, RealtimePostgresInsertPayload, SupabaseClient } from "@supabase/supabase-js";
import { BoardStore } from "@/features/board/board-state";
import { entryEvents } from "@/features/board/entries/custom-events";
import { fieldEvents } from "@/features/board/fields/custom-events";
import type { Field, FieldOption } from "@/features/board/fields/types";
import { cache } from "./cache";
import type { BoardCollaborator, InsertNotification, NotificationFetchObject, ViewNotification } from "@/features/board/user-management/types";
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
import type { Entry } from "@/features/board/entries/types";
import { topToolbarEvents } from "@/features/board/top-toolbar/custom-events";

export class RealtimeManager {
        private client: SupabaseClient;
        private clientId: string;
        private isInitialized = false;
        private activeBoardId: string | null = null;
        private activeBoardChannel: RealtimeChannel | null = null;
        private globalChannel: RealtimeChannel | null = null;

        constructor(client: SupabaseClient, clientId: string) {
                this.client = client;
                this.clientId = clientId;
        }

        async initGlobal(): Promise<void> {
                if (this.isInitialized) return;

                const acc = await supabase.getAccount();
                if (!acc) {
                        return;
                }

                this.globalChannel = this.client.channel('account_sync');
                this.globalChannel
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
                                table: 'field',
                        }, async (payload: { eventType: string, new: Field, old: Field }) => {
                                if (payload.old.board_id == this.activeBoardId) return;

                                await cache.clear(`fields_${payload.old.board_id}`)
                        })
                        .on('postgres_changes', {
                                event: 'INSERT',
                                schema: 'public',
                                table: 'notification',
                                filter: `to_acc_id=eq.${acc.id}`
                        }, async (payload: RealtimePostgresInsertPayload<InsertNotification>) => {
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

                this.isInitialized = true;
        }

        async switchActiveBoard(newBoardId: string): Promise<void> {
                if (this.activeBoardId === newBoardId) return;

                const acc = await supabase.getAccount();
                if (!acc) return;

                if (this.activeBoardChannel) {
                        await this.activeBoardChannel.unsubscribe();
                        this.activeBoardChannel = null;
                }

                this.activeBoardId = newBoardId;

                this.activeBoardChannel = this.client.channel(`board_ui_${newBoardId}`, {
                        config: { private: true }
                });

                this.activeBoardChannel
                        .on('broadcast', { event: 'ui_mutate' }, async (response: any) => {
                                const { scope, eventType, data, originClient } = response.payload;

                                if (originClient === this.clientId) return;

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
                                        case 'user':
                                                await handleBoardCollaboratorRealtime(eventType, data, acc);
                                                break;
                                }
                        });

                this.activeBoardChannel.subscribe();
        }

        async broadcastMutation(scope: string, eventType: string, data: any): Promise<void> {
                if (!this.activeBoardChannel) return;

                try {
                        await this.client.rpc("secure_broadcast_mutation", {
                                p_board_id: this.activeBoardId,
                                p_scope: scope,
                                p_origin_client: this.clientId,
                                p_event_type: eventType,
                                p_data: data
                        });
                } catch (err) {
                        console.error("Broadcast failed:", err);
                }
        }
}

async function handleBoardRealtime(eventType: string, data: Board) {
        cache.clear(`board_${data.id}`);

        switch (eventType) {
                case 'UPDATE':
                        window.dispatchEvent(workspaceEvents.boardTitleUpdate(data.name!));
                        break;
                case 'DELETE':
                        window.dispatchEvent(workspaceEvents.boardDeleted());
                        window.dispatchEvent(dashboardEvents.removeBoard(data.id!));
                        break;
        }
}

async function handleBoardCollaboratorRealtime(eventType: string, data: BoardCollaborator, acc: Account) {
        switch (eventType) {
                case 'INVITE-COLLABORATOR':
                        BoardStore.addCollaborator(data);
                        window.dispatchEvent(userManagementEvents.addCollaborator(data));
                        break;
                case 'UPDATE-COLLABORATOR':

                        BoardStore.updateCollaboratorPermission(data.account_id, data.permission_id);
                        if (acc.id != data.account_id) return
                        BoardStore.setPermissionId(data.permission_id);
                        const board = BoardStore.activeBoard;
                        if (board) {
                                updateBoardInCache(board)
                        }

                        window.dispatchEvent(topToolbarEvents.applyPermissionRestrictions());
                        window.dispatchEvent(fieldEvents.applyPermissionRestrictions());

                        break;
                case 'REMOVE-COLLABORATOR':
                        BoardStore.removeCollaborator(data.account_id);

                        window.dispatchEvent(userManagementEvents.removeCollaborator(data.account_id));
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
                case 'INSERT-ROWS':
                        const rows = data as Array<Array<Entry>>;
                        window.dispatchEvent(entryEvents.realtimeNewRows(rows))
                        break;
                case "INSERT-FIELD":
                        window.dispatchEvent(entryEvents.newFieldEntries({ field: data.field, entryIds: data.entryIds }));
                        break;
                case 'UPDATE':
                        window.dispatchEvent(entryEvents.realtimeEntryChange({ entryId: data.id, value: data.value }));
                        break;
                case 'MULTI-UPDATE':
                        window.dispatchEvent(entryEvents.entryChangeFieldValues({ fieldId: data.fieldId, oldValue: data.oldValue, value: data.newValue }));
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

async function handleBoardUpdated(data: Board) {
        if (data.deleted) {
                handleBoardDeleted(data.id!);
        }
        else {
                window.dispatchEvent(dashboardEvents.updateBoard({ id: data.id!, color: data.color, name: data.name }));
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

async function updateBoardInCache(board: Board) {
        const cachedBoard = await cache.get<Board>(`board_${board.id}`);
        if (cachedBoard) {
                cachedBoard.color = board.color;
                cachedBoard.name = board.name;
                cache.set(`board_${board.id}`, cachedBoard);
        }

        const cached = await cache.get<BoardFetchObject>("boards");
        if (!cached) return;

        const patchList = (list: Board[]) => {
                const idx = list.findIndex(b => b.id === board.id);
                if (idx === -1) return;

                list[idx].color = board.color;
                list[idx].name = board.name;
        };

        patchList(cached.owned);
        patchList(cached.shared);
        patchList(cached.deleted);

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
