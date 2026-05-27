import { createClient, SupabaseClient, type User } from '@supabase/supabase-js'
import { AutomationId, type Account, type Automation, type InsertBoard, type Entry, type Field, type FieldHelper, type InsertNotification, type NotificationFetchObject, type ViewNotification, type ViewBoard, type BoardFetchObject, PermissionId, type BoardCollaborator, type ApiKey } from './types';
import { showToast } from './utils';
import { Globals } from './globals';

export class Supabase {
        private client: SupabaseClient;
        private cachePrefix = "sb_cache_";

        constructor() {
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
                const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
                this.client = createClient(supabaseUrl, supabaseKey);
                this.client
                        .channel('realtime_notifications')
                        .on('postgres_changes', {
                                event: 'INSERT',
                                schema: 'public',
                                table: 'notification'
                        }, () => {
                                const toastContainer = document.getElementById("toast-container") as HTMLDivElement;
                                showToast("Notification text here", toastContainer, "success");
                        }
                        )
                        .subscribe()
        }

        private getCached<T>(key: string): T | null {
                const data = sessionStorage.getItem(this.cachePrefix + key);
                return data ? JSON.parse(data) as T : null;
        }

        private setCache(key: string, data: any): void {
                sessionStorage.setItem(this.cachePrefix + key, JSON.stringify(data));
        }

        private clearCache(key: string): void {
                sessionStorage.removeItem(this.cachePrefix + key);
        }

        private clearAllCache(): void {
                Object.keys(sessionStorage)
                        .filter(key => key.startsWith(this.cachePrefix))
                        .forEach(key => sessionStorage.removeItem(key));
        }

        async googleSignIn(): Promise<object> {
                const { data, error } = await this.client.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                                redirectTo: window.location.origin
                        }
                });

                if (error)
                        console.warn("Error signing in", error);

                return data
        }

        async getAuthUser(): Promise<User | null> {
                const { data: { user }, error } = await this.client.auth.getUser();

                if (error)
                        console.warn("Error fetching user", error);

                return user;
        }

        async signOut() {
                this.clearAllCache();
                const { error } = await this.client.auth.signOut();
                return { error };
        }

        onAuthStateChange(callback: (event: string, session: any) => void) {
                return this.client.auth.onAuthStateChange((event, session) => {
                        if (event === 'SIGNED_OUT') this.clearAllCache();
                        callback(event, session);
                });
        }

        async getAccount(): Promise<Account | undefined> {
                const { data: { user } } = await this.client.auth.getUser();
                if (!user) return;

                const cacheKey = `account_${user.id}`;
                const cached = this.getCached<Account>(cacheKey);
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

                        if (data) this.setCache(cacheKey, data);
                        return data;

                } catch (err) {
                        console.error(`Error getting acc by ID ${err}`);
                        return
                }
        }

        async insertBoard(board: InsertBoard): Promise<ViewBoard> {
                const cleanPayload = Object.fromEntries(
                        Object.entries(board).filter(([_, v]) => v !== undefined)
                );

                try {
                        const { data, error } = await this.client
                                .from("board")
                                .insert(cleanPayload)
                                .select()
                                .single();
                        if (error) throw error;

                        this.clearCache("boards");

                        const b = data as InsertBoard;

                        return {
                                id: b.id,
                                color: b.color,
                                created_at: b.created_at,
                                is_owner: true,
                                date_created: b.created_at,
                                name: b.name,
                                permission_id: PermissionId.Admin,
                                account_id: b.account_id,
                        } as ViewBoard;

                }
                catch (err) {
                        console.error(err)
                        throw err;
                }

        }

        async updateBoard(board: InsertBoard): Promise<InsertBoard> {
                const cleanPayload = Object.fromEntries(
                        Object.entries(board).filter(([_, v]) => v !== undefined)
                );

                const { data, error } = await this.client
                        .from("board")
                        .update(cleanPayload)
                        .eq("id", board.id)
                        .select()
                        .single();

                if (error) throw error;

                this.clearCache("boards");
                this.clearCache(`board_${board.id}`);

                return data;
        }

        async fetchBoards(): Promise<BoardFetchObject> {
                const cached = this.getCached<BoardFetchObject>("boards");
                if (cached) return cached;

                const { data, error } = await this.client
                        .from('user_boards')
                        .select("*");

                if (error) {
                        console.warn(error)
                        return { other: [], owner: [], all: [] } as BoardFetchObject;
                }

                const owner = data.filter(b => b.is_owner);
                const other = data.filter(b => !b.is_owner);
                const result = { owner: owner, other: other, all: data } as BoardFetchObject;

                this.setCache("boards", result);
                return result;
        }

        async fetchBoard(boardId: number): Promise<ViewBoard> {
                const cacheKey = `board_${boardId}`;
                const cached = this.getCached<ViewBoard>(cacheKey);
                if (cached) return cached;

                const { data, error } = await this.client
                        .from('user_boards')
                        .select('*')
                        .eq("id", boardId)
                        .single();

                if (error) {
                        console.warn(error)
                        throw error;
                }

                const result = data as ViewBoard;
                this.setCache(cacheKey, result);
                return result;
        }

        async boardCollaborators(boardId: number): Promise<Array<BoardCollaborator>> {
                let { data, error } = await this.client.rpc("board_collaborators", {
                        p_board_id: boardId,
                });

                if (error) console.warn("Error fetching board collaborators:", error);

                return data as Array<BoardCollaborator>;
        }

        async deleteBoard(boardId: number): Promise<void> {
                const { error } = await this.client
                        .from('board')
                        .delete()
                        .eq('id', boardId);
                if (error) {
                        console.warn("Error deleting board:", error);
                        return;
                }
                this.clearCache("boards");
                this.clearCache(`board_${boardId}`);
        }

        async kickCollaborator(accountId: string, boardId: number) {
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
                        .insert({
                                account_id: field.account_id,
                                board_id: field.board_id,
                                name: field.name,
                                type: field.type,
                                date_modified: new Date().toISOString()
                        })
                        .select("id, board_id, account_id, name, type, date_modified")
                        .single();

                if (error) {
                        console.warn(`Failed to insert field ${error.message}`);
                        throw error;
                }

                this.clearCache(`fields_${field.board_id}`);
                return data as Field;
        }

        async insertFieldWithEntries(field: Field): Promise<{ field: Field, entry_count: number }> {
                const { data, error } = await this.client.rpc('create_field_with_entries', {
                        p_requesting_acc_id: field.account_id,
                        p_board_id: field.board_id,
                        p_name: "",
                        p_type: field.type,
                });

                if (error) throw error;

                this.clearCache(`fields_${field.board_id}`);
                this.clearCache(`entries_${field.board_id}`);
                return data;
        }

        async updateField(fieldId: number, newName: string): Promise<void> {
                const { error: error } = await this.client
                        .from("field")
                        .update({
                                name: newName,
                        })
                        .eq("id", fieldId)
                        .select('board_id')
                        .single(); // Grab board_id to break cache

                if (error) {
                        console.warn(`Failed to update field ${error.message}`);
                        throw error;
                }
                // Ideal scenario: grab board_id out of response payload to selectively wipe
                // Alternatively, wipe all fields caches if board_id isn't dynamically known easily here
                this.clearAllCache();
        }

        async fetchEntry(id: number): Promise<Entry> {
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

        async fetchEntries(boardId: number, { fieldId, index }: { fieldId?: number; index?: number } = {}): Promise<Entry[]> {
                // We cache the base collection query of the board
                const isBaseQuery = fieldId === undefined && index === undefined;
                if (isBaseQuery) {
                        const cached = this.getCached<Entry[]>(`entries_${boardId}`);
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
                        this.setCache(`entries_${boardId}`, result);
                }
                return result;
        }

        async fetchFields(boardId: number, type?: string): Promise<Field[]> {
                const isBaseQuery = type === undefined;
                if (isBaseQuery) {
                        const cached = this.getCached<Field[]>(`fields_${boardId}`);
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

                const fieldHelpersMap = await this.fetchFieldHelpers(data!.map(e => Number(e.id)));
                for (const row of data!) {
                        (row as Field).fieldHelpers = fieldHelpersMap.get(row.id);
                }

                const result = data || [];
                if (isBaseQuery) {
                        this.setCache(`fields_${boardId}`, result);
                }
                return result;
        }

        async deleteField(fieldId: number): Promise<void> {
                const { error: fieldErr } = await this.client.from('field').delete().eq('id', fieldId);

                if (fieldErr) {
                        console.warn(`Failed to delete entry ${fieldErr}`);
                        throw fieldErr;
                }
                this.clearAllCache(); // Simplest way to ensure stale layouts don't persist
        }

        async fetchFieldHelpers(fieldIds: Array<number>): Promise<Map<number, Array<FieldHelper>>> {
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
                        let fieldHelpersArr = map.get(row.field_id);
                        if (!fieldHelpersArr) {
                                map.set(row.field_id, fieldHelpersArr = []);
                        }

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
                { id?: number, fieldId?: number, oldValue?: string, } = {}) {

                let query = this.client
                        .from('field_helper')
                        .update({ value: newValue });
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
                if (error)
                        console.warn("Error updating field status options:", error);

                this.clearCache(`${Globals.board!.id}`);
        }

        async insertFieldHelper(fieldId: number, value: string): Promise<FieldHelper> {
                const { data: data, error: error } = await this.client
                        .from('field_helper')
                        .insert({
                                field_id: fieldId,
                                value: value
                        })
                        .select("id, field_id, value")
                        .single();

                if (error) {
                        console.warn(`Failed to insert fieldHelper: ${error.message}`);
                        throw error;
                }

                this.clearCache(`${Globals.board!.id}`);
                return { id: data.id, field_id: data.field_id, value: data.value } as FieldHelper;
        }

        async deleteFieldHelper({ fieldIds, values }: { fieldIds?: Array<number>, values?: Array<string> }): Promise<void> {
                let query = this.client
                        .from('field_helper')
                        .delete();

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
                this.clearCache(`${Globals.board!.id}`);
        }

        async insertEntries(entries: Entry[]): Promise<Array<Entry>> {
                if (!entries.length || !entries[0].board_id) {
                        console.warn("error inserting entries, board_id is null");
                }
                const boardId = entries[0].board_id;

                const { data: data, error: error } = await this.client
                        .from('entry')
                        .insert(entries.map(entry => ({
                                board_id: entry.board_id,
                                field_id: entry.field_id,
                                account_id: entry.account_id,
                                index: entry.index,
                                value: entry.value
                        })))
                        .select("*");
                if (error) {
                        console.warn(`Failed to insert entries: ${error.message}`);
                        throw error;
                }

                if (boardId) this.clearCache(`entries_${boardId}`);
                return data || [];
        }

        async switchFieldIndex({ boardId, fieldId, oldIndex, newIndex }: {
                boardId: number, fieldId: number,
                oldIndex: number, newIndex: number
        }) {
                let { error } = await this.client.rpc("switch_field_index", {
                        p_board_id: boardId,
                        p_field_id: fieldId,
                        p_old_index: oldIndex,
                        p_new_index: newIndex
                });

                if (error) {
                        console.error(error);
                        throw error;
                }
                this.clearCache(`fields_${boardId}`);
        }

        async updateEntries(entries: Entry[]): Promise<void> {
                if (entries.length === 0) return;
                const boardId = entries[0].board_id;

                for (const entry of entries) {
                        const { error } = await this.client
                                .from('entry')
                                .update({
                                        board_id: entry.board_id,
                                        field_id: entry.field_id,
                                        account_id: entry.account_id,
                                        index: entry.index,
                                        value: entry.value
                                })
                                .eq('id', entry.id);

                        if (error) throw error;

                        try {
                                this.triggerAutomation(entry, [
                                        AutomationId.AnyFieldChange,
                                        AutomationId.StatusChange
                                ]);
                        }
                        catch (e) {
                                throw e;
                        }
                }

                if (boardId) this.clearCache(`entries_${boardId}`);
        }

        async triggerAutomation(entry: Entry, automationIds: AutomationId[]): Promise<boolean> {
                const automations = await this.fetchFieldAutomations(entry.board_id!, { fieldId: entry.field_id, automationIds: automationIds });
                if (automations.length == 0) {
                        return false;
                }

                const entries = await this.fetchEntries(entry.board_id!, { index: entry.index });
                const fields = await this.fetchFields(entry.board_id!);

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
                                        board_id: entry.board_id,
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
                boardId: number, { fieldIds, indicies, entryIds, }:
                        { entryIds?: number[]; fieldIds?: number[]; indicies?: number[] } = {}): Promise<void> {
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

                this.clearCache(`entries_${boardId}`);
        }

        async createFieldAutomation(automation: Automation): Promise<void> {
                const { error } = await this.client.from('field_automations').insert({
                        automation_id: automation.automation_id,
                        board_id: automation.board_id,
                        field_id: automation.field_id,
                        account_id: automation.account_id,
                        url_call: automation.url_call
                });

                if (error) {
                        console.warn(error);
                        throw error;
                }
        }

        async deleteFieldAutomation(automation: Automation): Promise<void> {
                const { error } = await this.client
                        .from('field_automations')
                        .delete()
                        .eq('board_id', automation.board_id)
                        .eq('field_id', automation.field_id)
                        .eq('automation_id', automation.automation_id)
                        .eq('url_call', automation.url_call);

                if (error) {
                        console.warn(`Failed to delete automation ${error.message}`);
                        throw error;
                }
        }

        async genApiKey(name: string): Promise<ApiKey> {
                const { data, error } = await this.client.rpc(
                        'gen_api_key',
                        { p_name: name }
                );

                if (error) {
                        console.error('Failed to generate key:', error.message);
                        throw error;
                }

                return data as ApiKey;
        }

        async removeApiKey(id: number) {
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

        async fetchFieldAutomations(boardId: number, { fieldId, automationIds }: {
                fieldId?: number, automationIds?: Array<AutomationId>
        } = {}): Promise<Array<Automation>> {
                let query = this.client
                        .from('field_automations')
                        .select('automation_id, board_id, field_id, url_call')
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

        async insertNotification(n: InsertNotification) {
                let { error } = await this.client.rpc("insert_notification", {
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
                this.clearCache("notifications");
        }

        async notificationResponse(notificationId: number, state: "accepted" | "declined" | "dismissed"): Promise<number | undefined> {
                let { data, error } = await this.client.rpc("notification_response", {
                        p_notification_id: notificationId,
                        p_state: state
                });

                if (error) console.error(error);

                this.clearCache("notifications");
                return data;
        }

        async fetchNotifications(): Promise<NotificationFetchObject> {
                const cached = this.getCached<NotificationFetchObject>("notifications");
                if (cached) return cached;

                const { data, error } = await this.client
                        .rpc("get_all_my_notifications")
                        .order("created_at", { ascending: false });

                if (error) throw error;

                const all = data as ViewNotification[];
                const received = all.filter(n => n.direction === 'received');
                const sent = all.filter(n => n.direction === 'sent');

                const result = { received, sent, all } as NotificationFetchObject;
                this.setCache("notifications", result);
                return result;
        }
}
