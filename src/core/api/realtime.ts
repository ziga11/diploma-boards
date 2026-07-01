import type { SupabaseClient } from "@supabase/supabase-js";
import { getAccount } from "../utils/utils";
import { BoardStore } from "@/features/board/board-state";
import { entryEvents } from "@/features/board/entries/custom-events";
import { fieldEvents } from "@/features/board/fields/custom-events";
import type { Field } from "@/features/board/fields/types";
import { cache } from "./cache";
import type { NotificationFetchObject } from "@/features/board/user-management/types";

export const CLIENT_ID = crypto.randomUUID();

let isInitialized = false;
let workspaceChannel: any = null;
let globalChannel: any = null;
let activeBoardChannel: any = null;
let activeBoardId: string | null = null;

export async function initGlobalRealtime(client: SupabaseClient) {
        if (isInitialized) return;

        const acc = await getAccount();
        if (!acc) return;

        globalChannel = client.channel(`account_sync_${acc.id}`, {
                config: { private: true }
        });

        globalChannel
                .on('broadcast', { event: 'invalidate_cache' }, async (response: any) => {
                        const { originClient, boardId } = response.payload;
                        if (originClient === CLIENT_ID) return;

                        console.log(`Background mutation detected. Clearing cache for: entries_${boardId}`);
                        /*                         await cache.clear(`entries_${boardId}`); */
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

        activeBoardChannel = client.channel(`board_ui_${newBoardId}`, {
                config: { private: true }
        });

        activeBoardChannel
                .on('broadcast', { event: 'ui_mutate' }, async (response: any) => {
                        const { originClient, scope, eventType, data } = response.payload;
                        if (originClient === CLIENT_ID) return;

                        switch (scope) {
                                case 'entry':
                                        await handleEntryRealtime(eventType, data, acc);
                                        break;
                                case 'field':
                                        await handleFieldRealtime(eventType, data, acc);
                                        break;
                                case 'field_helper':
                                        /*TODO: ...*/
                                        break;
                        }
                })
                .subscribe();
}

export async function broadcastMutation(scope: string, eventType: string, data: any) {
        if (!workspaceChannel) return;

        await workspaceChannel.send({
                type: 'broadcast',
                event: 'ui_mutate',
                payload: {
                        originClient: CLIENT_ID,
                        scope,
                        eventType,
                        data
                }
        });
}

async function handleFieldRealtime(eventType: string, data: any, acc: Account) {
        const boardId = data?.board_id;
        const activeBoardId = BoardStore.boardId;

        if (!boardId || !activeBoardId || activeBoardId != boardId || data.account_id == acc.id) return;

        switch (eventType) {
                case 'UPDATE':
                        window.dispatchEvent(entryEvents.realtimeEntryChange({
                                entryId: data.id,
                                value: data.value
                        }));
                        break;
                case 'DELETE':
                        window.dispatchEvent(fieldEvents.realtimeRemoveField(data.id))
                        window.dispatchEvent(entryEvents.deleteFieldEntries({ fieldId: data.id }))
                        break;
                case 'INSERT':
                        window.dispatchEvent(fieldEvents.realtimeAddField(data.field as Field));
                        window.dispatchEvent(entryEvents.newFieldEntries({ field: data.field, entryIds: data.entryIds }));
                        break;
        }
}

async function handleEntryRealtime(eventType: string, data: any, acc: Account) {
        const boardId = data?.board_id;
        if (!boardId || data.account_id == acc.id) return;

        await cache.clear(`entries_${boardId}`);

        const activeBoardId = BoardStore.boardId;
        if (activeBoardId != boardId) return;

        switch (eventType) {
                case 'UPDATE':
                        window.dispatchEvent(entryEvents.realtimeEntryChange({
                                entryId: data.id,
                                value: data.value
                        }));
                        break;
                case 'INSERT-ROW':
                        window.dispatchEvent(entryEvents.realtimeNewRows(data.entries))
                        break;
        }
}

async function handleBoardAccountLinkRealtime(eventType: string, data: any, acc: Account) {
        const boardId = data?.board_id;
        if (!boardId || data.account_id == acc.id) return;

        await cache.clear("boards");

        switch (eventType) {
                case 'UPDATE':
                        window.dispatchEvent(entryEvents.realtimeEntryChange({
                                entryId: data.id,
                                value: data.value
                        }));
                        break;
        }
}

async function appendNotificationToCache(newNotification: any) {
        let cached = await cache.get<NotificationFetchObject>("notifications");
        if (!cached) {
                cached = { all: [], received: [], sent: [] };
        }

        cached.all.unshift(newNotification);
        if (newNotification.direction === 'received') {
                cached.received.unshift(newNotification);
        } else {
                cached.sent.unshift(newNotification);
        }

        await cache.set("notifications", cached);
}
