import { createClient, SupabaseClient, type User } from '@supabase/supabase-js'
import { BoardStore } from '@/features/board/board-state';
import type { Automation, AutomationId } from '@/features/board/automations/types';
import type { BoardCollaborator, InsertNotification, NotificationFetchObject, ViewNotification } from '@/features/board/user-management/types';
import type { Field, FieldHelper } from '@/features/board/fields/types';
import type { Entry } from '@/features/board/entries/types';
import type { Board } from '@/features/board/workspace/types';
import type { BoardFetchObject } from '@/features/dashboard/workspace/types';
import { getAccount } from '../utils/utils';
import { cache } from './cache';
import { broadcastMutation, initGlobalRealtime } from './realtime';
import type { HistoryLog } from '@/features/board/history/types';

export const CLIENT_ID = crypto.randomUUID();
export class Supabase {
        private client: SupabaseClient;

        constructor() {
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
                const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
                this.client = createClient(supabaseUrl, supabaseKey);
        }

        async googleSignIn(): Promise<object> {
                const { data, error } = await this.client.auth.signInWithOAuth({
                        provider: 'google',
                        options: { redirectTo: window.location.origin }
                });

                if (error)
                        console.warn("Error signing in", error);

                return data
        }

        async getSessionUser(): Promise<User | undefined> {
                const session = (await this.client.auth.getSession()).data.session;
                if (!session || !session.user) return;


                return session.user;
        }

        async getAuthUser(): Promise<User | null> {
                const { data: { user }, error } = await this.client.auth.getUser();

                if (error)
                        console.warn("Error fetching user", error);

                return user;
        }

        async signOut() {
                cache.clearAll();
                const { error } = await this.client.auth.signOut();
                return { error };
        }

        initRealTime() { initGlobalRealtime(this.client); }

        onAuthStateChange(callback: (event: string, session: any) => void) {
                return this.client.auth.onAuthStateChange((event, session) => {
                        if (event === 'SIGNED_OUT') cache.clearAll();
                        if (event === 'SIGNED_IN' && session?.user) this.initRealTime();
                        callback(event, session);
                });
        }

        async getAccount(): Promise<Account | null> {
                const { data: { user } } = await this.client.auth.getUser();
                if (!user) return null;

                const cacheKey = `account_${user.id}`;
                const cached = await cache.get<Account>(cacheKey);
                if (cached) return cached;

                try {
                        const { error: err, data: data } = await this.client
                                .from("account")
                                .select()
                                .eq("id", user.id)
                                .maybeSingle();
                        if (err) {
                                console.error("Actual DB error:", err);
                        } else if (!data) {
                                console.log("No account found for this ID");
                        }

                        if (data) cache.set(cacheKey, data);
                        return data;

                } catch (err) {
                        console.error(`Error getting acc by ID ${err}`);
                        return null;
                }
        }

        async insertBoard(board: Board): Promise<void> {
                try {
                        const { error } = await this.client
                                .from("board")
                                .insert({
                                        id: board.id,
                                        name: board.name,
                                        date_created: board.date_created,
                                        color: board.color,
                                        account_id: board.account_id,
                                });

                        if (error) throw error;
                        cache.clear("boards");
                }
                catch (err) {
                        console.error(err)
                        throw err;
                }
        }

        async updateBoard(id: string, newName: string) {
                const { error } = await this.client
                        .from("board")
                        .update({
                                name: newName,
                                id: id,
                        })
                        .eq("id", id)


                if (error) {
                        console.error(error);
                        throw error;
                }

                cache.clear("boards");
                cache.clear(`board_${id}`);
        }

        async fetchBoards(): Promise<BoardFetchObject> {
                const cached = await cache.get<BoardFetchObject>("boards");
                if (cached) return cached;

                const { data, error } = await this.client
                        .from('user_boards')
                        .select("*");


                if (error) {
                        console.warn(error)
                        return { shared: [], owned: [], all: [] } as BoardFetchObject;
                }


                const owned = data.filter(b => b.is_owner);
                const shared = data.filter(b => !b.is_owner);
                const result = { owned, shared, all: data } as BoardFetchObject;

                cache.set("boards", result);
                return result;
        }

        async fetchBoard(boardId: string): Promise<Board> {
                const acc = await getAccount();
                if (!acc) throw new Error("Not logged in");

                const cacheKey = `board_${boardId}`;
                const cached = await cache.get<Board>(cacheKey);
                if (cached) return cached;

                const { data, error } = await this.client
                        .from('user_boards')
                        .select('id, name, date_created, color, permission_id, is_owner, account_id')
                        .eq("id", boardId)
                        .single();

                if (error) {
                        console.warn(error)
                        throw error;
                }

                const result = data as Board;
                cache.set(cacheKey, result);
                return result;
        }

        async boardCollaborators(boardId: string): Promise<Array<BoardCollaborator>> {
                let { data, error } = await this.client.rpc("board_collaborators", {
                        p_board_id: boardId,
                });

                if (error) console.warn("Error fetching board collaborators:", error);

                return data as Array<BoardCollaborator>;
        }

        async deleteBoard(boardId: string): Promise<void> {
                const { error } = await this.client
                        .from('board')
                        .delete()
                        .eq('id', boardId);

                if (error) {
                        console.warn("Error deleting board:", error);
                        return;
                }

                cache.clear("boards");
                cache.clear(`board_${boardId}`);
        }

        async kickCollaborator(accountId: string, boardId: string) {
                const { error } = await this.client
                        .from('board_account_link')
                        .delete()
                        .eq('board_id', boardId)
                        .eq('account_id', accountId);

                if (error) console.warn("Error deleting board:", error);
        }

        async insertField(field: Field): Promise<Field> {
                let { data, error } = await this.client
                        .from("field")
                        .insert(field)
                        .select("id, board_id, account_id, name, type, date_modified")
                        .single();

                if (error) {
                        console.warn(`Failed to insert field ${error.message}`);
                        throw error;
                }

                cache.clear(`fields_${field.board_id}`);
                return data as Field;
        }

        async insertFieldWithEntries(field: Field, entryIds: Array<string>): Promise<{ field: Field, entries: Entry[] }> {
                const { data, error } = await this.client.rpc('create_field_with_entries', {
                        p_field_id: field.id,
                        p_entry_ids: entryIds,
                        p_requesting_acc_id: field.account_id,
                        p_board_id: field.board_id,
                        p_name: "",
                        p_type: field.type,
                });

                if (error) throw error;

                cache.clear(`fields_${field.board_id}`);
                cache.clear(`entries_${field.board_id}`);
                return data;
        }

        async updateField(id: string, newName: string): Promise<void> {
                const { data, error } = await this.client
                        .from("field")
                        .update({
                                name: newName,
                                id: id,
                        })
                        .eq("id", id)
                        .select('board_id')
                        .single();

                if (error) {
                        console.error(error);
                        throw error;
                }

                if (data?.board_id) {
                        cache.clear(`fields_${data.board_id}`);
                }
        }

        async fetchEntry(id: string): Promise<Entry> {
                const { data, error } = await this.client
                        .from('entry_with_field')
                        .select('*')
                        .eq('id', id)
                        .single();
                if (error) {
                        console.warn(`Failed to fetch entry ${error.message}`);
                        throw error;
                }

                return data as Entry;
        }

        async fetchEntries(boardId: string, { fieldId, index }: { fieldId?: string; index?: number } = {}): Promise<Entry[]> {
                const isBaseQuery = fieldId === undefined && index === undefined;
                if (isBaseQuery) {
                        const cached = await cache.get<Entry[]>(`entries_${boardId}`);
                        if (cached) return cached;
                }

                let query = this.client
                        .from('entry_with_field')
                        .select('*')
                        .eq('board_id', boardId);

                if (fieldId !== undefined) {
                        query = query.eq('field_id', fieldId);
                }

                if (index !== undefined) {
                        query = query.eq('index', index);
                }

                const { data, error } = await query
                        .order('index', { ascending: true })
                        .order('field_index', { ascending: true });

                if (error) {
                        console.warn("Error fetching entries:", error);
                        throw error;
                }

                const result = data || [];
                if (isBaseQuery) {
                        cache.set(`entries_${boardId}`, result);
                }
                return result;
        }

        async fetchFields(boardId: string, type?: string): Promise<Field[]> {
                const isBaseQuery = type === undefined;
                if (isBaseQuery) {
                        const cached = await cache.get<Field[]>(`fields_${boardId}`);
                        if (cached) return cached;
                }

                let query = this.client
                        .from('field')
                        .select(`id, name, type, date_modified, account_id, board_id, index`)
                        .eq('board_id', boardId);

                if (type) query = query.eq('type', type);

                const { data, error } = await query.order('index', { ascending: true });
                if (error) {
                        console.warn("Error fetching fields:", error);
                        return [];
                }
                if (!data) {
                        console.warn("No existing fields");
                        return [];
                }


                const result = data || [];
                if (isBaseQuery) {
                        cache.set(`fields_${boardId}`, result);
                }
                return result;
        }

        async deleteField(fieldId: string): Promise<void> {
                const { error: fieldErr } = await this.client.from('field')
                        .delete().eq('id', fieldId);

                if (fieldErr) {
                        console.warn(`Failed to delete entry ${fieldErr.message}`);
                        throw fieldErr;
                }
                cache.clearAll();
        }

        async fetchFieldHelpers(fieldIds: Array<string>): Promise<Map<string, Array<FieldHelper>>> {
                const { data, error } = await this.client
                        .from("field_helper")
                        .select("id, field_id, value")
                        .in("field_id", fieldIds);

                if (error) {
                        console.warn("Error fetching field helpers:", error);
                        throw error;
                }

                let map = new Map();
                for (const row of data) {
                        if (!map.has(row.field_id)) {
                                map.set(row.field_id, []);
                        };
                        const fieldHelpersArr = map.get(row.field_id);

                        const fieldHelper = {
                                id: row.id,
                                field_id: row.field_id,
                                value: row.value
                        } as FieldHelper;
                        fieldHelpersArr.push(fieldHelper);
                }

                return map;
        }

        async updateFieldHelper(newValue: string, { id, fieldId, oldValue }:
                { id?: string, fieldId?: string, oldValue?: string }) {
                let updatePayload = { value: newValue } as { value: string, id?: string };

                if (id) {
                        updatePayload.id = id;
                }

                let query = this.client
                        .from('field_helper')
                        .update(updatePayload);


                if (id) {
                        query = query.eq('id', id);
                }
                if (fieldId) {
                        query = query.eq('field_id', fieldId);
                }
                if (oldValue) {
                        query = query.eq('value', oldValue);
                }

                const { error } = await query;
                if (error) throw new Error(`Failed to update field helper ${error.message}`)

                const boardId = BoardStore.boardId;
                if (!boardId) throw new Error(`Board wasn't set`)

                cache.clear(`fields_${boardId}`);
        }

        async insertFieldHelper(fieldHelper: FieldHelper): Promise<void> {
                const { error } = await this.client
                        .from('field_helper')
                        .insert(fieldHelper);

                if (error) {
                        console.warn(`Failed to insert fieldHelper: ${error.message}`);
                        throw error;
                }

                const boardId = BoardStore.boardId;
                if (!boardId) throw new Error(`Board wasn't set`)

                cache.clear(`fields_${boardId}`);
        }


        async deleteFieldHelpers({ id, fieldIds, values }: { id?: string, fieldIds?: Array<string>, values?: Array<string> }): Promise<void> {
                let query = this.client
                        .from('field_helper')
                        .delete();

                if (id) {
                        query.eq("id", id);
                }

                if (fieldIds) {
                        query.in("field_id", fieldIds);
                }
                if (values) {
                        query.in("value", values);
                }

                const { error } = await query;

                if (error) {
                        console.warn(`Failed to delete field helper values: ${error.message}`);
                        throw error;
                }
        }

        async insertEntryRows(entries: Array<Entry>): Promise<void> {
                const boardId = BoardStore.boardId;
                if (!entries.length || !boardId) {
                        console.warn("error inserting entries, board_id is null or there's no entries");
                }

                const acc = await getAccount();
                if (!acc) {
                        console.warn("account not set");
                        return;
                }

                const { error } = await this.client
                        .from('entry')
                        .insert(entries.map(e => {
                                e.board_id = boardId!;
                                e.account_id = acc.id;

                                return {
                                        id: e.id,
                                        field_id: e.field_id,
                                        board_id: boardId,
                                        index: e.index,
                                        account_id: acc.id!,
                                        value: e.value
                                }
                        }));
                if (error) {
                        console.warn(`Failed to insert entries: ${error.message}`);
                        throw error;
                }

                broadcastMutation("entry", "insert:row", entries)

                if (boardId) cache.clear(`entries_${boardId}`);
        }

        async switchFieldIndex({ boardId, fieldId, oldIndex, newIndex }: {
                boardId: string, fieldId: string,
                oldIndex: number, newIndex: number
        }) {
                const { error } = await this.client.rpc("switch_field_index", {
                        p_board_id: boardId,
                        p_field_id: fieldId,
                        p_old_index: oldIndex,
                        p_new_index: newIndex
                });

                if (error) {
                        console.error(error);
                        throw error;
                }

                cache.clear(`fields_${boardId}`);
                cache.clear(`entries_${boardId}`);

                broadcastMutation("field", "swap", { boardId, fieldId, oldIndex, newIndex });
        }

        async updateEntries(...entries: Entry[]): Promise<void> {
                if (entries.length === 0) return;
                const boardId = BoardStore.boardId;
                if (!boardId) throw new Error("Failed to get the boardId");

                for (const entry of entries) {

                        const { error } = await this.client
                                .from('entry')
                                .update({
                                        id: entry.id,
                                        value: entry.value,
                                })
                                .eq('id', entry.id);
                        /*updating id for the trigger to get it alongside the value */

                        if (error) throw error;
                }

                cache.clear(`entries_${boardId}`);

                broadcastMutation("entry", "update:row", entries)
        }

        async triggerAutomation(automationIds: AutomationId[], { entry, boardId, fieldId, entryId, rowIndex }: {
                entryId?: string,
                boardId?: string,
                fieldId?: string,
                rowIndex?: number,
                entry?: Entry
        }): Promise<boolean> {
                if (!entry || (!fieldId || !entryId || !rowIndex || !boardId)) return false;

                const automations = await this.fetchFieldAutomations(boardId ?? entry.board_id,
                        { fieldId: fieldId ?? entry.field_id, automationIds: automationIds });
                if (automations.length == 0) return false;

                const entries = await this.fetchEntries(boardId ?? entry.board_id, { index: rowIndex ?? entry.index });
                const fields = await this.fetchFields(boardId ?? entry.board_id);

                const objArr: Record<string, { field: Field; entry: Entry }> = {};
                for (let i = 0; i < fields.length; i++) {
                        objArr[`${fields[i].id!}`] = {
                                field: fields[i],
                                entry: entries[i],
                        };
                }

                for (const automation of automations) {
                        const resp = await fetch(automation.url_call, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                        type: automation.type,
                                        board_id: boardId ?? entry.board_id,
                                        row_count: fields.length,
                                        rows: objArr,
                                })
                        });
                        if (!resp.ok) {
                                const text = await resp.text();
                                throw new Error(`HTTP Error ${resp.status}: ${text}`);
                        }
                }

                return true;
        }

        async deleteEntries(
                boardId: string, { fieldIds, indicies, entryIds, }:
                        { entryIds?: Array<string>; fieldIds?: Array<string>; indicies?: number[] } = {}): Promise<void> {
                let query = this.client
                        .from('entry')
                        .delete()
                        .eq('board_id', boardId);

                if (entryIds) {
                        query = query.in('id', entryIds);
                }
                if (fieldIds) {
                        query = query.in('field_id', fieldIds);
                }
                if (indicies) {
                        query = query.in('index', indicies);
                }

                const { error } = await query;
                if (error) {
                        console.warn("Error deleting entries:", error);
                        throw error;
                }

                cache.clear(`entries_${boardId}`);
        }

        async insertFieldAutomation(automation: Automation): Promise<Automation> {
                const { data, error } = await this.client.from('field_automations')
                        .insert(automation)
                        .select()
                        .single();

                if (error) {
                        console.warn(error);
                        throw error;
                }

                return data as Automation;
        }

        async deleteFieldAutomation(id: string): Promise<Automation> {
                const { data, error } = await this.client
                        .from('field_automations')
                        .delete()
                        .eq('id', id)
                        .select("*")
                        .single();

                if (error) {
                        console.warn(`Failed to delete automation ${error.message}`);
                        throw error;
                }

                return data as Automation;
        }

        async fetchFieldAutomations(boardId: string, { fieldId, automationIds }:
                { fieldId?: string, automationIds?: Array<AutomationId> } = {}): Promise<Array<Automation>> {
                let query = this.client
                        .from('field_automations')
                        .select('id, automation_id, board_id, field_id, url_call')
                        .eq('board_id', boardId);

                if (fieldId !== undefined) {
                        query = query.eq('field_id', fieldId);
                }
                if (automationIds !== undefined) {
                        query = query.in('automation_id', automationIds);
                }

                const { data, error } = await query;
                if (error) console.warn(`Failed to fetch action field link: ${error.message}`);

                return data as Array<Automation>;
        }

        async genApiKey(id: string, name: string): Promise<ApiKey> {
                const { data, error } = await this.client.rpc(
                        'gen_api_key',
                        { p_id: id, p_name: name }
                );

                if (error) {
                        console.error('Failed to generate key:', error.message);
                        throw error;
                }

                return data as ApiKey;
        }

        async removeApiKey(id: string) {
                const { error } = await this.client
                        .from('api_key')
                        .delete()
                        .eq('id', id);

                if (error) console.warn("Error deleting board:", error);
        }

        async fetchApiKeys(): Promise<Array<ApiKey>> {
                let { data, error } = await this.client.rpc("get_api_keys");

                if (error) {
                        console.warn(`Failed to fetch api keys ${error}`);
                        throw error;
                }

                return data as Array<ApiKey>;
        }

        async insertNotification(n: InsertNotification) {
                let { error } = await this.client.rpc("insert_notification", {
                        p_id: n.id,
                        p_from_acc_id: n.from_acc_id,
                        p_to_acc_id: n.to_acc_id,
                        p_to_acc_email: n.to_acc_email,
                        p_message: n.message,
                        p_board_id: n.board_id,
                        p_permission_id: n.permission_id,
                        p_state: n.state,
                        p_type: n.type
                });

                if (error) console.error(error);
                cache.clear("notifications");
        }

        async notificationResponse(id: string, notificationId: string, state: "accepted" | "declined" | "dismissed"): Promise<string> {
                let { data, error } = await this.client.rpc("notification_response", {
                        p_id: id,
                        p_notification_id: notificationId,
                        p_state: state,
                });

                if (error) {
                        console.error(`error responding to a notification -> ${error.message}`);

                        throw new Error(`Failed to process notification response ${error}`);
                }

                cache.clear("notifications");
                return data;
        }

        async fetchNotifications(): Promise<NotificationFetchObject> {
                const cached = await cache.get<NotificationFetchObject>("notifications");
                if (cached) return cached;

                const { data, error } = await this.client
                        .rpc("get_all_my_notifications")
                        .order("created_at", { ascending: false });

                if (error) throw error;

                const all = data as ViewNotification[];
                const received = all.filter(n => n.direction === 'received');
                const sent = all.filter(n => n.direction === 'sent');

                const result = { received, sent, all } as NotificationFetchObject;
                cache.set("notifications", result);
                return result;
        }

        async fetchHistory(): Promise<Array<HistoryLog>> {
                const boardId = BoardStore.boardId;
                if (!boardId) throw new Error(`Board wasn't set`)

                const { data, error } = await this.client
                        .from('history_log')
                        .select('*')
                        .eq('board_id', boardId);

                console.log(data);


                if (error) throw error;

                return data as Array<HistoryLog>
        }
}

export const supabase = new Supabase();
