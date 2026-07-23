import { createClient, SupabaseClient, type PostgrestResponse } from '@supabase/supabase-js'
import { BoardState } from '@/features/board/board-state';
import { AutomationId, type Automation } from '@/features/board/automations/types';
import type { Collaborator, InvitedCollaborator, NotificationFetchObject, ViewNotification } from '@/features/board/user-management/types';
import type { Field, FieldOption } from '@/features/board/fields/types';
import type { Entry } from '@/features/board/entries/types';
import type { Board } from '@/features/board/workspace/types';
import type { BoardFetchObject } from '@/features/dashboard/workspace/types';
import { RealtimeManager } from './realtime';
import type { EntryLog, HistoryLog } from '@/features/board/history/types';
import { PermissionId } from '../types/auth';

export class Supabase {
        private client: SupabaseClient;
        public realtime: RealtimeManager;
        private account?: Account;
        private accountPromise?: Promise<Account>;
        private clientId: string = crypto.randomUUID();

        constructor() {
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
                const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

                this.client = createClient(supabaseUrl, supabaseKey);
                this.realtime = new RealtimeManager(this.client, this.clientId);
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

        async getAccount() {
                if (this.account) return this.account;

                if (this.accountPromise) return this.accountPromise;

                this.accountPromise = (async () => {
                        const { data: { user } } = await this.client.auth.getUser();
                        if (!user) {
                                this.accountPromise = undefined;
                                throw new Error("Signed out");
                        }

                        const acc = {
                                id: user.id,
                                email: user.email,
                                avatar_url: user.user_metadata?.avatar_url,
                                name: user.user_metadata?.name,
                                last_sign_in_date: user.last_sign_in_at,
                        } as Account;

                        this.account = acc;
                        return acc;
                })();

                return this.accountPromise;
        }

        async signOut() {
                this.account = undefined;
                this.accountPromise = undefined;

                localStorage.clear();

                const { error } = await this.client.auth.signOut();
                return { error };
        }

        initRealTime() { this.realtime.initGlobal(); }

        onAuthStateChange(callback: (event: string, session: any) => void) {
                return this.client.auth.onAuthStateChange((event, session) => {
                        if (event === 'SIGNED_OUT') {
                                this.account = undefined;
                                this.accountPromise = undefined;
                        }
                        if (event === 'SIGNED_IN' && session?.user) this.initRealTime();
                        callback(event, session);
                });
        }

        async insertBoard(board: Board): Promise<void> {
                try {
                        const { error } = await this.client.rpc('insert_board', {
                                p_board_id: board.id,
                                p_name: board.name,
                                p_color: board.color,
                        });

                        if (error) throw error;
                }
                catch (err) {
                        console.error(err)
                        throw err;
                }
        }

        async updateBoard(id: string, newName?: string, color?: string) {
                const { error } = await this.client.rpc('update_board', {
                        p_board_id: id,
                        p_name: newName,
                        p_color: color,
                        p_client_id: this.clientId,
                }) as PostgrestResponse<Board>;
                if (error) {
                        console.error(error);
                        throw error;
                }
        }

        async fetchBoards(): Promise<BoardFetchObject> {
                const { data, error } = await this.client.rpc('get_user_boards') as PostgrestResponse<Board>;

                if (error) {
                        console.warn(error)
                        return { shared: [], deleted: [], owned: [], all: [] } as BoardFetchObject;
                }

                const owned = data.filter(b => ((b.permission_id == PermissionId.Owner) && !b.deleted));
                const shared = data.filter(b => !(b.permission_id == PermissionId.Owner));
                const deleted = data.filter(b => b.deleted);
                const result = { owned, shared, deleted, all: data } as BoardFetchObject;

                return result;
        }

        async fetchBoard(boardId: string): Promise<Board> {
                const acc = this.account;
                if (!acc) throw new Error("Not logged in");

                const { data, error } = await this.client.rpc('get_board_by_id', {
                        p_board_id: boardId
                });

                if (error) {
                        console.warn(error)
                        throw error;
                }

                const result = data as Board;


                return result;
        }

        async fetchCollaborators(boardId: string): Promise<Collaborator[]> {
                const { data, error } = await this.client.rpc("fetch_collaborators", { p_board_id: boardId });

                if (error) {
                        throw new Error(error.message);
                }

                return data;
        }

        async fetchInvitedCollaborators(boardId: string): Promise<InvitedCollaborator[]> {
                const { data, error } = await this.client.rpc("fetch_invited_collaborators", { p_board_id: boardId });

                if (error) {
                        throw new Error(error.message);
                }

                return data;
        }

        async deleteBoard(): Promise<void> {
                const boardId = BoardState.boardId;
                if (!boardId) throw new Error(`Board ID wasn't set`)

                const { error } = await this.client.rpc('update_board', {
                        p_board_id: boardId,
                        p_deleted: true,
                        p_client_id: this.clientId,
                }) as PostgrestResponse<Board>;

                if (error) {
                        console.warn("Error deleting board:", error);
                        return;
                }
        }

        async recoverBoard(boardId: string): Promise<void> {
                const { error } = await this.client.rpc('update_board', {
                        p_board_id: boardId,
                        p_deleted: false,
                        p_client_id: this.clientId,
                }) as PostgrestResponse<Board>;

                if (error) {
                        console.warn("Error deleting board:", error);
                        return;
                }
        }

        async leaveBoard() {
                const boardId = BoardState.boardId;
                if (!boardId) throw new Error(`Board ID wasn't set`)

                const acc = this.account;
                if (!acc) throw new Error("Account not set");

                const { error } = await this.client
                        .from('board_account_link')
                        .delete()
                        .eq('board_id', boardId)
                        .eq('account_id', acc.id);

                if (error) console.warn("Error leaving the board:", error);
        }

        async changeCollaboratorAccess(otherAccId: string, newPermissionId: number) {
                const boardId = BoardState.boardId;
                if (!boardId) throw new Error(`Board ID wasn't set`)

                const { error } = await this.client.rpc("change_collaborator_access", {
                        p_board_id: boardId,
                        p_other_acc_id: otherAccId,
                        p_permission_id: newPermissionId,
                        p_client_id: this.clientId
                });

                if (error) console.warn("Error changing collaborator permissions", error);
        }

        async removeInvitation(email: string) {
                const boardId = BoardState.boardId;

                const { error } = await this.client.rpc("remove_invitation", {
                        p_board_id: boardId,
                        p_to_email: email,
                        p_client_id: this.clientId
                });

                if (error) console.warn("Error leaving the board:", error);
        }

        async kickCollaborator(otherAccId: string) {
                const boardId = BoardState.boardId;

                const { error } = await this.client.rpc("remove_collaborator", {
                        p_board_id: boardId,
                        p_other_acc_id: otherAccId,
                        p_client_id: this.clientId
                });

                if (error) console.warn("Error leaving the board:", error);
        }

        async insertFieldWithEntries(field: Field, entryIds: Array<string>): Promise<{ field: Field, entries: Entry[] }> {
                const { data, error } = await this.client.rpc('create_field_with_entries', {
                        p_field_id: field.id,
                        p_entry_ids: entryIds,
                        p_board_id: field.board_id,
                        p_name: "",
                        p_type: field.type,
                        p_client_id: this.clientId,
                });

                if (error) throw error;

                if (field.type === "button") {
                        const fieldOption = {
                                id: data.option_id,
                                account_id: field.account_id,
                                value: "",
                                field_id: field.id,
                        } as FieldOption;

                        if (!field.options) field.options = {};

                        field.options[data.option_id] = fieldOption;
                }

                return { field: data.field, entries: data.entries };
        }

        async updateField(id: string, newName: string): Promise<void> {
                let { error } = await this.client.rpc("update_field_name", {
                        p_field_id: id,
                        p_name: newName,
                        p_client_id: this.clientId,
                });

                if (error) {
                        console.error(error);
                        throw error;
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

        async fetchEntries(boardId: string, { entryIds, fieldId, index }: { entryIds?: string[], fieldId?: string; index?: number } = {}): Promise<Entry[]> {
                let { data, error } = await this.client.rpc("fetch_entries", {
                        p_board_id: boardId,
                        p_field_id: fieldId,
                        p_index: index,
                        p_entry_ids: entryIds,
                });

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
                        lastSearch = BoardState.searchQuery;
                        lastSort = `${BoardState.sortedBy?.fieldId} ${BoardState.sortedBy?.ascending}`;

                        const { data, error } = await this.client.rpc('get_board_page', {
                                p_board_id: boardId,
                                p_search: lastSearch.length > 0 ? lastSearch : null,
                                p_sort_field_id: BoardState.sortedBy?.fieldId ?? null,
                                p_ascending: BoardState.sortedBy?.ascending ?? true,
                                p_limit: BATCH_SIZE,
                                p_offset: offset
                        });

                        if (error) throw error;

                        if (!data) {
                                console.log("no data");

                                return;
                        }

                        yield data as Array<Entry>;

                        offset += data.length;

                        const currSearch = BoardState.searchQuery;
                        const currSort = `${BoardState.sortedBy?.fieldId} ${BoardState.sortedBy?.ascending}`;

                        if (currSearch != lastSearch || currSort != lastSort) {
                                offset = 0;
                        }
                        else if (data.length < BATCH_SIZE) {
                                return;
                        }
                }
        }

        async fetchFields(boardId: string): Promise<Field[]> {
                const { data, error } = await this.client.rpc("fetch_fields", {
                        p_board_id: boardId,
                });

                if (error) {
                        console.warn(`Failed to delete field: ${error.message}`);
                        throw error;
                }

                return data as Field[];
        }

        async deleteField(fieldId: string): Promise<void> {
                const { error } = await this.client.rpc("delete_field_with_entries", {
                        p_field_id: fieldId,
                        p_client_id: this.clientId,
                });
                if (error) {
                        console.warn(`Failed to delete field: ${error.message}`);
                        throw error;
                }
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
                const boardId = BoardState.boardId;
                if (!boardId) throw new Error(`Board ID wasn't set`)

                const { error } = await this.client.rpc("update_option", {
                        p_option_id: id,
                        p_new_value: value,
                        p_client_id: this.clientId,
                });

                if (error) throw new Error(`Failed to update field option ${error.message}`)
        }

        async insertFieldOption(fieldOption: FieldOption): Promise<void> {
                const boardId = BoardState.boardId;
                if (!boardId) throw new Error(`Board wasn't set`)

                const { error } = await this.client.rpc("insert_option", {
                        p_option_id: fieldOption.id,
                        p_field_id: fieldOption.field_id,
                        p_value: fieldOption.value,
                        p_client_id: this.clientId,
                });

                if (error) {
                        console.warn(`Failed to insert fieldOption: ${error.message}`);
                        throw error;
                }
        }

        async deleteFieldOptions({ id, fieldId, value }: { id?: string, fieldId?: string, value?: string }): Promise<void> {
                const { error } = await this.client.rpc("delete_option", {
                        p_option_id: id,
                        p_field_id: fieldId,
                        p_value: value,
                        p_client_id: this.clientId,
                });

                if (error) {
                        console.warn(`Failed to delete field option values: ${error.message}`);
                        throw error;
                }
        }

        async insertEmptyEntryRows(fieldIdEntryIdMap?: Record<string, string>[], rowCount: number = 1): Promise<{ entries: Entry[], row_index: number }[]> {
                const boardId = BoardState.boardId;
                if (!boardId) {
                        console.warn("error inserting entries, board_id is null or there's no entries");
                        throw new Error("Board ID null");
                }

                const acc = this.account;
                if (!acc) {
                        console.warn("account not set");
                        throw new Error("Account not set");
                }

                const payload = {
                        p_board_id: boardId,
                        p_account_id: acc.id,
                        p_entry_field_id_map: fieldIdEntryIdMap,
                        p_row_count: rowCount,
                        p_client_id: this.clientId,
                };

                const { data: rows, error } = await this.client.rpc("insert_empty_entry_rows", payload);

                if (error) {
                        console.warn(`Failed to insert entries: ${error.message}`);
                        throw error;
                }

                return (rows as { entries: Entry[], row_index: number }[]);
        }

        async insertEntryRows(entrySets: Array<Array<Entry>>): Promise<Array<number>> {
                const boardId = BoardState.boardId;
                if (!entrySets.length || !boardId) {
                        console.warn("error inserting entries, board_id is null or there's no entries");
                }

                type json_entry = {
                        id?: string;
                        field_id?: string;
                        value?: string;
                        option_id?: string;
                };

                const payload = {
                        p_board_id: boardId,
                        p_entry_rows: [] as json_entry[][],
                        p_client_id: this.clientId,
                };

                for (const entries of entrySets) {
                        const row: json_entry[] = [];
                        for (const entry of entries) {
                                row.push({
                                        id: entry.id,
                                        field_id: entry.field_id,
                                        value: entry.value,
                                        option_id: entry.option_id
                                } as json_entry);
                        }
                        payload.p_entry_rows.push(row);
                }

                type rowPayload = {
                        entries: Array<Entry>
                        row_index: number,
                };

                const { data: rows, error } = await this.client.rpc("insert_entry_rows", payload);
                if (error) {
                        console.warn(`Failed to insert entryRows: ${error.message}`);
                        throw error;
                }

                const indices = [];

                const entryRowsArr: Entry[][] = [];
                for (const row of rows as rowPayload[]) {
                        indices.push(row.row_index);
                        entryRowsArr.push(row.entries);
                }

                return indices;
        }

        async switchFieldIndex({ boardId, field1_id, field2_id }: {
                boardId: string, field1_id: string, field2_id: string
        }) {
                const { error } = await this.client.rpc("switch_field_index", {
                        p_board_id: boardId,
                        p_field1_id: field1_id,
                        p_field2_id: field2_id,
                        p_client_id: this.clientId,
                });

                if (error) {
                        console.error(error);
                        throw error;
                }
        }

        async updateEntry({ id, value, optionId }: { id: string, value?: string, optionId?: string }): Promise<void> {
                const { data, error } = await this.client.rpc("update_entry", {
                        p_entry_id: id,
                        p_value: value,
                        p_option_id: optionId,
                        p_client_id: this.clientId,
                });

                if (error) {
                        console.error(error);

                        throw error;
                }

                supabase.triggerAutomation([
                        value ? AutomationId.TextChange : AutomationId.StatusChange,
                        AutomationId.AnyFieldChange,
                ], { entry: data });
        }

        async triggerAutomation(automationIds: Array<AutomationId>, { entry, fieldId, entryId, rowIndex }: {
                entryId?: string,
                fieldId?: string,
                rowIndex?: number,
                entry?: Entry
        }): Promise<boolean> {
                const boardId = BoardState.boardId;

                const hasExplicitParams = fieldId != null && entryId != null && rowIndex != null && boardId != null;
                if (!hasExplicitParams && !entry) {
                        return false;
                }

                const resolvedFieldId = fieldId ?? entry?.field_id;
                const resolvedRowIndex = rowIndex ?? entry?.index;

                if (!boardId || resolvedRowIndex == null) {
                        return false;
                }

                const automations: Array<Automation> = [];
                for (const automationId of automationIds) {
                        if (automationId <= AutomationId.ButtonPress) {
                                if (resolvedFieldId != null) {
                                        const a = BoardState.getFieldAutomation(automationId, resolvedFieldId);
                                        if (a) automations.push(a);
                                }
                        } else {
                                const as = BoardState.getTypeAutomations(automationId);
                                if (as) {
                                        automations.push(...as);
                                }
                        }
                }

                if (automations.length === 0) return false;

                const entries = await this.fetchEntries(boardId, { index: resolvedRowIndex });
                const fields = Array.from(BoardState.fields.values());

                const objArr: Record<string, { field: Field; entry: Entry }> = {};
                for (let i = 0; i < fields.length; i++) {
                        if (fields[i]?.id != null) {
                                objArr[`${fields[i].id}`] = {
                                        field: fields[i],
                                        entry: entries[i],
                                };
                        }
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
                        p_client_id: this.clientId,
                })

                const { error } = await query;
                if (error) {
                        console.warn("Error deleting entries:", error);
                        throw error;
                }
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

                this.realtime.broadcastMutation("automation", "DELETE", data)

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

        async inviteCollaborator({ id, to_email, permission_id }: { id: string, to_email: string, permission_id: number }): Promise<InvitedCollaborator> {
                const boardId = BoardState.boardId;
                if (!boardId) throw new Error("board id not set");

                let { data, error } = await this.client.rpc("invite_collaborator", {
                        p_id: id,
                        p_board_id: boardId,
                        p_to_account_email: to_email,
                        p_permission_id: permission_id,
                });

                if (error) {
                        console.error(error);
                        throw new Error(error.message);
                }

                return data
        }

        async notificationResponse(id: string, notificationId: string, state: "accepted" | "declined" | "dismissed"): Promise<string> {
                let { data, error } = await this.client.rpc("notification_response", {
                        p_id: id,
                        p_notification_id: notificationId,
                        p_state: state,
                        p_client_id: this.clientId
                });

                if (error) {
                        console.error(`error responding to a notification -> ${error.message}`);

                        throw new Error(`Failed to process notification response ${error}`);
                }

                return data;
        }

        async fetchNotifications(): Promise<NotificationFetchObject> {
                const { data, error } = await this.client
                        .rpc("fetch_notifications")
                        .order("created_at", { ascending: false });

                if (error) throw error;

                const all = data as ViewNotification[];
                const received = all.filter(n => n.direction === 'received');
                const sent = all.filter(n => n.direction === 'sent');

                const result = { received, sent, all } as NotificationFetchObject;
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
                const boardId = BoardState.boardId;
                if (!boardId) throw new Error(`Board ID wasn't set`);

                const BATCH_SIZE = 250;
                let lastCreatedAt: string | null = null;

                while (true) {
                        let query = this.client
                                .from('board_history_logs_light')
                                .select('*')
                                .eq('board_id', boardId)
                                .order('created_at', { ascending: false })
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
                const boardId = BoardState.boardId;
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
                const boardId = BoardState.boardId;
                if (!boardId) throw new Error("board id null");

                const { count, error } = await this.client
                        .from('entry')
                        .select('*', { count: 'exact', head: true })
                        .eq('board_id', boardId);

                if (error) throw error;

                return count ?? 0;
        }

        async initBoardRealtime() {
                const boardId = BoardState.boardId;
                if (!boardId) return;

                this.realtime.switchActiveBoard(boardId);
        }
}

export const supabase = new Supabase();
