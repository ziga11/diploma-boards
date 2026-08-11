import type { RealtimeChannel, RealtimePostgresDeletePayload, RealtimePostgresInsertPayload, SupabaseClient } from "@supabase/supabase-js";
import { entryEvents } from "@/features/board/entries/custom-events";
import { fieldEvents } from "@/features/board/fields/custom-events";
import type { FieldOption } from "@/features/board/fields/types";
import type { InsertNotification } from "@/features/board/user-management/types";
import type { Board } from "@/features/dashboard/add-board/types";
import { notificationEvents } from "@/features/dashboard/notifications/custom-events";
import { dashboardEvents } from "@/features/dashboard/workspace/custom-events";
import { userManagementEvents } from "@/features/board/user-management/custom-events";
import { workspaceEvents } from "@/features/board/workspace/custom-events";
import { automationEvents } from "@/features/board/automations/custom-events";
import { type AutomationDB } from "@/features/board/automations/types";
import { supabase } from "./supabase";
import type { Entry } from "@/features/board/entries/types";
import { topToolbarEvents } from "@/features/board/top-toolbar/custom-events";
import { MasterRegistry } from "@/features/board/master-registry";
import { usersToken } from "@/features/board/user-management/registry";
import { workspaceToken } from "@/features/board/workspace/registry";
import { automationsToken } from "@/features/board/automations/registry";
import { PermissionId } from "@/core/types/auth";
import { DBToAutomation } from "@/features/board/automations/logic";

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
                                event: 'INSERT',
                                schema: 'public',
                                table: 'notification',
                                filter: `to_account_id=eq.${acc.id}`
                        }, async (payload: RealtimePostgresInsertPayload<InsertNotification>) => {
                                handleNotificationInserted(payload.new);
                        })
                        .on('postgres_changes', {
                                event: 'DELETE',
                                schema: 'public',
                                table: 'notification',
                                filter: `to_account_id=eq.${acc.id}`
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

async function handleBoardCollaboratorRealtime(eventType: string, data: any, acc: Account) {
        switch (eventType) {
                case 'INSERT-INVITATION':
                        MasterRegistry.get(usersToken).addInvitedCollaborator(data);

                        window.dispatchEvent(userManagementEvents.addInvitedCollaborator(data));
                        break;
                case 'COLLABORATION-INVITATION-ACCEPTED':
                        MasterRegistry.get(usersToken).addCollaborator(data);

                        window.dispatchEvent(userManagementEvents.addCollaborator(data));
                        break;
                case 'UPDATE-COLLABORATOR':
                        MasterRegistry.get(usersToken).updateCollaboratorPermission(data.account_id, data.permission_id);
                        if (acc.id != data.account_id) return

                        MasterRegistry.get(workspaceToken).setPermissionId(data.permission_id);

                        window.dispatchEvent(topToolbarEvents.applyPermissionRestrictions());

                        const isMember = data.permission_id == PermissionId.Member;

                        window.dispatchEvent(fieldEvents.applyPermissionRestrictions({ isMember }));
                        window.dispatchEvent(entryEvents.applyPermissionRestrictions({ isMember }));

                        break;
                case 'REMOVE-INVITATION':
                        MasterRegistry.get(usersToken).removeInvitedCollaborator(data.account_id);

                        window.dispatchEvent(userManagementEvents.removeInvitedCollaborator(data));
                        break;
                case 'REMOVE-COLLABORATOR':
                        MasterRegistry.get(usersToken).removeCollaborator(data.account_id);

                        window.dispatchEvent(userManagementEvents.removeCollaborator(data.account_id));
                        if (acc.id == data.account_id) {
                                window.dispatchEvent(workspaceEvents.kickedFromBoard());
                        }
                        break;
        }
}

async function handleAutomationRealtime(eventType: string, data: AutomationDB) {
        switch (eventType) {
                case 'INSERT':
                        const automation = DBToAutomation(data);
                        window.dispatchEvent(automationEvents.addAutomation(automation));
                        break;
                case 'DELETE':
                        MasterRegistry.get(automationsToken).removeAutomationById(data.id!);

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
                        const rows = data as { entries: Array<Entry>, index: number }[];

                        window.dispatchEvent(entryEvents.realtimeNewRows(rows))
                        break;
                case "INSERT-FIELD":
                        window.dispatchEvent(entryEvents.createFieldEntries({ field: data.field, entryIds: data.entry_ids }));
                        break;
                case 'UPDATE':
                        window.dispatchEvent(entryEvents.realtimeEntryChange({ entry_id: data.id, value: data.value, option_id: data.option_id }));
                        break;
                case 'MULTI-UPDATE':
                        window.dispatchEvent(entryEvents.entryChangeFieldValues({ field_id: data.fieldId, old_value: data.oldValue, value: data.newValue }));
                        break;
                case 'DELETE-ROWS':
                        window.dispatchEvent(entryEvents.removeEntriesUi({ indices: data.indices }));
                        break;
                case 'DELETE-FIELD':
                        window.dispatchEvent(entryEvents.removeEntriesUi({ fieldId: data.field_id }));
                        break;
                case 'DELETE-FIELD-OPTION':
                        window.dispatchEvent(entryEvents.entryChangeFieldValues({ field_id: data.field_id!, value: "", old_value: data.value }))
                        break;
        }
}

async function handleBoardUpdated(data: Board) {
        if (data.deleted) {
                handleBoardDeleted(data.id!);
        }
        else {

                window.dispatchEvent(dashboardEvents.updateBoard({ id: data.id!, color: data.color, name: data.name }));
        }
}
async function handleBoardDeleted(id: string) {
        window.dispatchEvent(dashboardEvents.removeBoard(id));
}

async function handleNotificationInserted(data: InsertNotification) {
        const n = await supabase.fetchNotification(data.id!);

        window.dispatchEvent(notificationEvents.addNotification(n));
}
async function handleNotificationDeleted(id: string) {
        window.dispatchEvent(notificationEvents.removeNotification(id));
}
