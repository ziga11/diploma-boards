import { createClient, SupabaseClient, type PostgrestResponse, type User } from '@supabase/supabase-js'
import { BoardStore } from '@/features/board/board-state';
import { AutomationId, type Automation } from '@/features/board/automations/types';
import type { BoardCollaborator, InsertNotification, NotificationFetchObject, ViewNotification } from '@/features/board/user-management/types';
import type { Field, FieldOption } from '@/features/board/fields/types';
import type { Entry } from '@/features/board/entries/types';
import type { Board } from '@/features/board/workspace/types';
import type { BoardFetchObject } from '@/features/dashboard/workspace/types';
import { getAccount } from '../utils/utils';
import { cache } from './cache';
import { broadcastMutation, initGlobalRealtime, switchActiveBoardRealtime } from './realtime';
import type { EntryLog, HistoryLog } from '@/features/board/history/types';
import { PermissionId } from '../types/auth';

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
                        const { error } = await this.client.rpc('insert_board', {
                                p_requesting_acc_id: null,
                                p_board_id: board.id,
                                p_name: board.name,
                                p_color: board.color
                        });

                        if (error) throw error;

                        await cache.set(`board_${board.id}`, board);

                        const boardObj = (await cache.get("boards") ?? { all: [], shared: [], deleted: [], owned: [] }) as BoardFetchObject;

                        boardObj.all.push(board);
                        boardObj.owned.push(board);

                        await cache.set("boards", boardObj);
                }
                catch (err) {
                        console.error(err)
                        throw err;
                }
        }

        async updateBoard(id: string, newName: string) {
                const { error } = await this.client.rpc('update_board', {
                        p_board_id: id,
                        p_name: newName,
                }) as PostgrestResponse<Board>;
                if (error) {
                        console.error(error);
                        throw error;
                }

                const cachedBoard = await cache.get<Board>(`board_${id}`);
                if (cachedBoard) {
                        cachedBoard.name = newName;
                        cache.set(`board_${id}`, cachedBoard);
                }

                const cachedBoards = await cache.get<BoardFetchObject>("boards");
                if (cachedBoards) {
                        const patchList = (list: Board[]) => {
                                const idx = list.findIndex(b => b.id === id);
                                if (idx !== -1) list[idx] = { ...list[idx], name: newName };
                        };

                        patchList(cachedBoards.owned);
                        patchList(cachedBoards.shared);
                        patchList(cachedBoards.all);
                        cache.set("boards", cachedBoards);
                }

                broadcastMutation("board", "UPDATE", { id, name: newName } as Board);
        }

        async fetchBoards(): Promise<BoardFetchObject> {
                /* const cached = await cache.get<BoardFetchObject>("boards");
                if (cached) return cached; */

                const { data, error } = await this.client.rpc('get_user_boards') as PostgrestResponse<Board>;

                if (error) {
                        console.warn(error)
                        return { shared: [], deleted: [], owned: [], all: [] } as BoardFetchObject;
                }

                const owned = data.filter(b => ((b.permission_id == PermissionId.Owner) && !b.deleted));
                const shared = data.filter(b => !(b.permission_id == PermissionId.Owner));
                const deleted = data.filter(b => b.deleted);
                const result = { owned, shared, deleted, all: data } as BoardFetchObject;

                cache.set("boards", result);
                data.forEach(b => cache.set(`board_${b.id}`, b));
                return result;
        }

        async fetchBoard(boardId: string): Promise<Board> {
                const acc = await getAccount();
                if (!acc) throw new Error("Not logged in");

                const cacheKey = `board_${boardId}`;
                const cached = await cache.get<Board>(cacheKey);
                if (cached) return cached;

                const { data, error } = await this.client.rpc('get_board_by_id', {
                        p_board_id: boardId
                });

                if (error) {
                        console.warn(error)
                        throw error;
                }

                const result = data as Board;
                await cache.set(cacheKey, result);

                const boardObj = (await cache.get("boards") ?? { all: [], shared: [], deleted: [], owned: [] }) as BoardFetchObject;
                boardObj.all.push(result);
                if (result.permission_id == PermissionId.Owner) {
                        boardObj.owned.push(result);
                }
                else if (!result.deleted) {
                        boardObj.shared.push(result);
                }
                else {
                        boardObj.deleted.push(result);
                }

                return result;
        }

        async fetchCollaborators(boardId: string, boardAccLinkIds?: Array<string>): Promise<Array<BoardCollaborator>> {
                let { data, error } = await this.client.rpc("fetch_collaborators", {
                        p_board_id: boardId,
                        p_board_acc_link_ids: boardAccLinkIds,
                });

                if (error) {
                        throw new Error(error.message);
                }

                return data as Array<BoardCollaborator>;
        }

        async deleteBoard(boardId: string): Promise<void> {
                const { error } = await this.client
                        .from('board')
                        .update({ deleted: true })
                        .eq('id', boardId);

                if (error) {
                        console.warn("Error deleting board:", error);
                        return;
                }

                const boardObj = await cache.get("boards") as BoardFetchObject;
                if (!boardObj) return;

                const delBoard = boardObj.all.find(b => b.id === boardId);

                await cache.clear(`board_${boardId}`);
                if (!delBoard) return;

                delBoard.deleted = true;

                const ownedIndex = boardObj.owned.findIndex(b => b.id === boardId);
                if (ownedIndex !== -1) {
                        boardObj.owned.splice(ownedIndex, 1);
                } else {
                        const sharedIndex = boardObj.shared.findIndex(b => b.id === boardId);
                        if (sharedIndex !== -1) boardObj.shared.splice(sharedIndex, 1);
                }

                boardObj.deleted.push(delBoard);

                broadcastMutation("board", "DELETE", { id: boardId });

                await cache.set("boards", boardObj);
        }

        async recoverBoard(boardId: string): Promise<void> {
                const { error } = await this.client
                        .from('board')
                        .update({ deleted: false })
                        .eq('id', boardId);

                if (error) {
                        console.warn("Error deleting board:", error);
                        return;
                }

                const boardObj = await cache.get("boards") as BoardFetchObject;
                if (!boardObj) return;

                const delBoard = boardObj.all.find(b => b.id === boardId);
                if (!delBoard) return;

                delBoard.deleted = false;

                boardObj.owned.push(delBoard);

                const delIndex = boardObj.deleted.findIndex(b => b.id === boardId);
                boardObj.deleted.splice(delIndex, 1);

                await cache.set(`board_${boardId}`, delBoard);
                await cache.set("boards", boardObj);
        }

        async kickCollaborator(accountId: string, boardId: string) {
                const { error } = await this.client
                        .from('board_account_link')
                        .delete()
                        .eq('board_id', boardId)
                        .eq('account_id', accountId);

                if (error) console.warn("Error leaving the board:", error);

                const boardObj = await cache.get("boards") as BoardFetchObject;
                if (!boardObj) return;

                const allIndex = boardObj.all.findIndex(b => b.id === boardId);
                boardObj.deleted.splice(allIndex, 1);

                const sharedIndex = boardObj.shared.findIndex(b => b.id === boardId);
                boardObj.deleted.splice(sharedIndex, 1);

                await cache.clear(`board_${boardId}`);

                await cache.set("boards", boardObj);

        }

        async insertFieldWithEntries(field: Field, entryIds: Array<string>): Promise<{ field: Field, entries: Entry[] }> {
                const optionId = field.type === "button" ? crypto.randomUUID() : null;

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

                broadcastMutation("field", "INSERT", field);
                broadcastMutation("entry", "INSERT-FIELD", { field, entryIds });

                if (data.option_id) {
                        const fieldOption = {
                                id: optionId,
                                account_id: field.account_id,
                                value: "",
                                field_id: field.id,
                        } as FieldOption;

                        field.options = [fieldOption];
                }

                return { field: data.field, entries: data.entries };
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

                broadcastMutation("field", "UPDATE", { id, name: newName } as Field);

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
                let query = this.client
                        .from('entry_with_field')
                        .select('*')
                        .eq('board_id', boardId)
                        .eq('field_deleted', false);

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

                return data || [];
        }

        async *fetchPagedEntries(boardId: string, fieldCount: number): AsyncGenerator<Array<Entry>> {
                const BATCH_SIZE = fieldCount * 35;
                let lastSort: string | undefined;
                let lastSearch: string | undefined;
                let offset = 0;

                while (true) {
                        lastSearch = BoardStore.searchQuery;
                        lastSort = `${BoardStore.sortedBy?.fieldId} ${BoardStore.sortedBy?.ascending}`;

                        const { data, error } = await this.client.rpc('get_board_page', {
                                p_board_id: boardId,
                                p_search: lastSearch.length > 0 ? lastSearch : null,
                                p_sort_field_id: BoardStore.sortedBy?.fieldId ?? null,
                                p_ascending: BoardStore.sortedBy?.ascending ?? true,
                                p_limit: BATCH_SIZE,
                                p_offset: offset
                        });

                        if (error) throw error;

                        if (!data) {
                                console.log("data undefined/null");
                                return;
                        }

                        yield data as Array<Entry>;

                        offset += data.length;

                        const currSearch = BoardStore.searchQuery;
                        const currSort = `${BoardStore.sortedBy?.fieldId} ${BoardStore.sortedBy?.ascending}`;

                        if (currSearch != lastSearch || currSort != lastSort) {
                                offset = 0;
                        }
                        else if (data.length < BATCH_SIZE) {
                                return;
                        }
                }
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
                        .eq('board_id', boardId)
                        .eq('deleted', false);

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
                return data || [];
        }

        async deleteField(fieldId: string): Promise<void> {
                const { error: fieldErr } =
                        await this.client.from('field')
                                .update({
                                        id: fieldId,
                                        deleted: true,
                                }).eq('id', fieldId);

                if (fieldErr) {
                        console.warn(`Failed to delete entry ${fieldErr.message}`);
                        throw fieldErr;
                }

                broadcastMutation("field", "DELETE", fieldId);
                broadcastMutation("entry", "DELETE-FIELD", fieldId);

                cache.clearAll();
        }

        async fetchFieldOptions(fieldIds: Array<string>): Promise<Map<string, Array<FieldOption>>> {
                const { data, error } = await this.client
                        .from("field_option")
                        .select("id, field_id, value")
                        .in("field_id", fieldIds);

                if (error) {
                        console.warn("Error fetching field options:", error);
                        throw error;
                }

                let map = new Map();
                for (const row of data) {
                        if (!map.has(row.field_id)) {
                                map.set(row.field_id, []);
                        };
                        const options = map.get(row.field_id);

                        const option = {
                                id: row.id,
                                field_id: row.field_id,
                                value: row.value
                        } as FieldOption;
                        options.push(option);
                }

                return map;
        }

        async updateFieldOption(id: string, value: string) {
                let query = this.client
                        .from('field_option')
                        .update({ value: value })
                        .eq('id', id);

                const { error } = await query;
                if (error) throw new Error(`Failed to update field option ${error.message}`)
                broadcastMutation("field_option", "UPDATE", { id, value: value } as FieldOption);

                const boardId = BoardStore.boardId;
                if (!boardId) throw new Error(`Board wasn't set`)

                cache.clear(`fields_${boardId}`);
        }

        async insertFieldOption(fieldOption: FieldOption): Promise<void> {
                const { error } = await this.client
                        .from('field_option')
                        .insert(fieldOption);

                if (error) {
                        console.warn(`Failed to insert fieldOption: ${error.message}`);
                        throw error;
                }

                const boardId = BoardStore.boardId;
                if (!boardId) throw new Error(`Board wasn't set`)

                broadcastMutation("field_option", "INSERT", fieldOption);
                cache.clear(`fields_${boardId}`);
        }

        async deleteFieldOptions({ id, fieldIds, values }: { id?: string, fieldIds?: Array<string>, values?: Array<string> }): Promise<void> {
                let query = this.client
                        .from('field_option')
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
                broadcastMutation("field_option", "DELETE", id);
                broadcastMutation("entry", "DELETE-FIELD-OPTION", id);

                if (error) {
                        console.warn(`Failed to delete field option values: ${error.message}`);
                        throw error;
                }
        }

        async insertEntryRow(entries: Array<Entry>): Promise<number> {
                const boardId = BoardStore.boardId;
                if (!entries.length || !boardId) {
                        console.warn("error inserting entries, board_id is null or there's no entries");
                        throw new Error("Board ID null or no entries");
                }

                const acc = await getAccount();
                if (!acc) {
                        console.warn("account not set");
                        throw new Error("Account not set");
                }

                const payload = {
                        p_board_id: boardId,
                        p_account_id: acc.id,
                        p_entry_ids: [] as Array<string>,
                        p_field_ids: [] as Array<string>,
                        p_values: [] as Array<string>,
                };

                for (const entry of entries) {
                        payload.p_entry_ids.push(entry.id ?? "");
                        payload.p_field_ids.push(entry.field_id ?? "");
                        payload.p_values.push(entry.value ?? "");
                }

                const { data, error } = await this.client.rpc("insert_entry_row", payload);
                if (error) {
                        console.warn(`Failed to insert entries: ${error.message}`);
                        throw error;
                }

                for (const entry of entries) {
                        entry.index = data;
                }

                broadcastMutation("entry", "INSERT-ROW", entries)

                return data;
        }

        async insertEntryRows(entrySets: Array<Array<Entry>>): Promise<Array<number>> {
                const boardId = BoardStore.boardId;
                if (!entrySets.length || !boardId) {
                        console.warn("error inserting entries, board_id is null or there's no entries");
                }

                const acc = await getAccount();
                if (!acc) {
                        console.warn("account not set");
                        throw new Error("account not set");
                }

                const payload = {
                        p_board_id: boardId,
                        p_account_id: acc.id,
                        p_row_count: entrySets.length,
                        p_entry_ids: [] as (string | null)[][],
                        p_field_ids: [] as string[][],
                        p_values: [] as string[][],
                        p_option_ids: [] as (string | null)[][],
                };

                for (const entries of entrySets) {
                        const ids: (string | null)[] = [];
                        const fields: string[] = [];
                        const vals: string[] = [];
                        const optionIds: (string | null)[] = [];

                        for (const entry of entries) {
                                ids.push(entry.id ?? null);
                                fields.push(entry.field_id!);
                                vals.push(entry.value ?? "");
                                optionIds.push(entry.option_id ?? null);
                        }

                        payload.p_entry_ids.push(ids);
                        payload.p_field_ids.push(fields);
                        payload.p_values.push(vals);
                        payload.p_option_ids.push(optionIds);
                }

                const { data, error } = await this.client.rpc("insert_entry_rows", payload);
                if (error) {
                        console.warn(`Failed to insert entryRows: ${error.message}`);
                        throw error;
                }

                for (const entries of entrySets) {
                        broadcastMutation("entry", "INSERT-ROW", entries);
                }

                return data;
        }

        async switchFieldIndex({ boardId, field1_id, field2_id }: {
                boardId: string, field1_id: string, field2_id: string
        }) {
                const { error } = await this.client.rpc("switch_field_index", {
                        p_board_id: boardId,
                        p_field1_id: field1_id,
                        p_field2_id: field2_id
                });

                if (error) {
                        console.error(error);
                        throw error;
                }

                cache.clear(`fields_${boardId}`);

                broadcastMutation("field", "UPDATE-SWAP", { field1_id: field1_id, field2_id: field2_id });
        }

        async updateEntries({ fieldId, oldValue, newValue }: { fieldId: string, oldValue: string, newValue: string }) {
                const boardId = BoardStore.boardId;
                if (!boardId) throw new Error("Failed to get the boardId");

                const { error } = await this.client
                        .from('entry')
                        .update({ value: newValue })
                        .eq('value', oldValue)
                        .eq('board_id', boardId)
                        .eq('field_id', fieldId);

                if (error) throw error;

                /*TODO: ...*/
                broadcastMutation("entry", "MULTI-UPDATE", { fieldId, oldValue, newValue });
        }

        async updateEntry({ id, value, optionId }: { id: string, value?: string, optionId?: string }): Promise<void> {
                const boardId = BoardStore.boardId;
                if (!boardId) throw new Error("Failed to get the boardId");

                let payload = { id } as any;

                if (value) {
                        payload.value = value;
                }
                else if (optionId) {
                        payload.option_id = optionId;
                }

                const { error } = await this.client
                        .from('entry')
                        .update(payload)
                        .eq('id', id);

                if (error) {
                        console.log(error);

                        throw error;
                }

                broadcastMutation("entry", "UPDATE", { id, value })
        }

        async triggerAutomation(automationIds: Array<AutomationId>, { entry, fieldId, entryId, rowIndex }: {
                entryId?: string,
                fieldId?: string,
                rowIndex?: number,
                entry?: Entry
        }): Promise<boolean> {
                const boardId = BoardStore.boardId;

                if (!(fieldId && entryId && rowIndex && boardId) && !entry) {
                        return false;
                }

                const automations: Array<Automation> = [];
                for (const automationId of automationIds) {
                        const key = automationId <= AutomationId.ButtonPress ? fieldId ?? entry!.field_id! : `${automationId}`;

                        const as = (BoardStore.automations.get(key) ?? []) as Array<Automation>;
                        for (const a of as) {
                                if (a.automation_id === automationId) {
                                        automations.push(a);
                                        break;
                                }
                        }
                }

                if (!automations || automations.length == 0) return false;

                const entries = await this.fetchEntries(boardId!, { index: rowIndex ?? entry!.index });
                const fields = await this.fetchFields(boardId!);

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
                                        board_id: boardId,
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

        async deleteEntryRows(boardId: string, indices: Array<number>): Promise<void> {
                let query = this.client.rpc("delete_entry_rows", {
                        p_board_id: boardId,
                        p_indices: indices,
                })

                const { error } = await query;
                if (error) {
                        console.warn("Error deleting entries:", error);
                        throw error;
                }

                broadcastMutation("entry", "DELETE-ROWS", { indices })
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

                broadcastMutation("automation", "DELETE", { id })

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

        async insertNotification(n: InsertNotification): Promise<ViewNotification> {

                let { data, error } = await this.client.rpc("insert_notification", {
                        p_id: n.id ?? null,
                        p_from_acc_id: n.from_acc_id,
                        p_to_acc_id: n.to_acc_id ?? null,
                        p_to_acc_email: n.to_acc_email ?? null,
                        p_message: n.message,
                        p_board_id: n.board_id ?? null,
                        p_permission_id: n.permission_id ?? null,
                        p_state: n.state ?? null,
                        p_type: n.type
                });

                if (error) {
                        console.error(error);
                        throw new Error(error.message);
                }
                cache.clear("notifications");

                return data;
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
                /* const cached = await cache.get<NotificationFetchObject>("notifications");
                if (cached) return cached; */

                const { data, error } = await this.client
                        .rpc("fetch_notifications")
                        .order("created_at", { ascending: false });

                if (error) throw error;

                const all = data as ViewNotification[];
                const received = all.filter(n => n.direction === 'received');
                const sent = all.filter(n => n.direction === 'sent');

                const result = { received, sent, all } as NotificationFetchObject;
                /*                 cache.set("notifications", result); */
                return result;
        }

        async fetchNotification(id: string): Promise<ViewNotification> {
                const { data, error } = await this.client
                        .rpc("fetch_notifications", { p_id: id });

                if (error) throw error;

                const all = data as ViewNotification[];
                return all[0];
        }

        async *fetchHistory(): AsyncGenerator<Array<HistoryLog>> {
                const boardId = BoardStore.boardId;
                if (!boardId) throw new Error(`Board ID wasn't set`);

                const BATCH_SIZE = 250;
                let lastCreatedAt: string | null = null;

                while (true) {
                        let query = this.client
                                .from('board_history_logs_light')
                                .select('*')
                                .eq('board_id', boardId)
                                .order('created_at', { ascending: true })
                                .limit(BATCH_SIZE);

                        if (lastCreatedAt) {
                                query = query.gt('created_at', lastCreatedAt);
                        }

                        const { data, error } = await query;

                        if (error) throw error;
                        if (!data || data.length === 0) return;

                        yield data as Array<HistoryLog>;

                        lastCreatedAt = data[data.length - 1].created_at;
                        if (data.length < BATCH_SIZE) return;
                }
        }

        async *fetchHistoryLogEntries(logId: string): AsyncGenerator<Array<EntryLog>> {
                const boardId = BoardStore.boardId;
                if (!boardId) throw new Error(`Board ID wasn't set`);

                const BATCH_SIZE = 250;
                let returnCount = 0;

                while (true) {
                        const { data, error } = await this.client.rpc('get_history_entries', {
                                p_log_id: logId, p_board_id: boardId, p_offset: returnCount, p_limit: 250
                        });

                        if (error) throw error;
                        if (!data || data.length === 0) return;

                        yield data as Array<EntryLog>;

                        returnCount += BATCH_SIZE;
                        if (data.length < BATCH_SIZE) return;
                }
        }

        async fetchEntryCount(): Promise<number> {
                const boardId = BoardStore.boardId;
                if (!boardId) throw new Error("board id null");

                const { count, error } = await this.client
                        .from('entry')
                        .select('*', { count: 'exact', head: true })
                        .eq('board_id', boardId);

                if (error) throw error;

                return count ?? 0;
        }

        async initBoardRealtime() {
                const boardId = BoardStore.boardId;
                if (!boardId) return;

                switchActiveBoardRealtime(this.client, boardId);
        }
}

export const supabase = new Supabase();
