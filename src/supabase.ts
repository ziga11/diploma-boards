import { createClient, SupabaseClient, type Session } from '@supabase/supabase-js'
import { AutomationId, type Account, type Automation, type Board, type Entry, type Field, type FieldHelper } from './types';
import { showToast } from './utils';

export class Supabase {
        private client: SupabaseClient;

        constructor() {
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
                const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
                this.client = createClient(supabaseUrl, supabaseKey);
                this.client
                        .channel('realtime_notifications')
                        .on(
                                'postgres_changes',
                                {
                                        event: 'INSERT',
                                        schema: 'public',
                                        table: 'notification'
                                },
                                (payload) => {
                                        console.log(payload);
                                        const toastContainer = document.getElementById("toast-container") as HTMLDivElement;
                                        showToast("Notification text here", toastContainer, "success");
                                }
                        )
                        .subscribe()
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

        async getSession(): Promise<Session | null> {
                const { data: { session }, error } = await this.client.auth.getSession();

                if (error)
                        console.warn("Error fetching session", error);

                return session;
        }

        async signOut() {
                const { error } = await this.client.auth.signOut();
                return { error };
        }

        onAuthStateChange(callback: (event: string, session: any) => void) {
                return this.client.auth.onAuthStateChange(callback);
        }

        async upsertAccount(acc: Account): Promise<Account | undefined> {
                try {
                        const { error: error, data: data } = await this.client
                                .from("account")
                                .upsert({
                                        email: acc.email,
                                        name: acc.name,
                                        avatar_url: acc.avatar_url,
                                        last_sign_in_date: acc.last_sign_in_date,
                                }, { onConflict: "email" })
                                .select()
                                .single();
                        if (error)
                                console.warn("Error upserting account", error)

                        return data as Account;
                } catch (error) {
                        console.error("Error upserting account! ", error);
                }
        }

        async insertBoard(board: Board): Promise<Board> {
                const cleanPayload = Object.fromEntries(
                        Object.entries(board).filter(([_, v]) => v !== undefined)
                );

                const { data, error } = await this.client
                        .from("board")
                        .upsert(cleanPayload, { onConflict: "id" })
                        .select()
                        .single();
                if (error) throw error;

                return data;
        }

        async updateBoard(board: Board): Promise<Board> {
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

                return data;
        }

        async fetchBoards(accountId: number): Promise<Board[]> {
                const { data, error } = await this.client
                        .from('board')
                        .select('id, name, date_created, color')
                        .eq("account_id", accountId);

                if (error) {
                        console.warn(error)
                        return [];
                };

                return data || [];
        }

        async deleteBoard(boardId: number): Promise<void> {
                const { error } = await this.client
                        .from('board')
                        .delete()
                        .eq('id', boardId);
                if (error) console.warn("Error deleting board:", error);
        }

        async insertField(field: Field): Promise<Field | undefined> {
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
                        return;
                }

                return data as Field;
        }

        async updateField(field: Field): Promise<Field | undefined> {
                const { data: data, error: error } = await this.client
                        .from("field")
                        .update({
                                type: field.type,
                                name: field.name,
                        })
                        .eq("id", field.id)
                        .select("id, board_id, account_id, name, type, date_modified")
                        .single();
                if (error) {
                        console.warn(`Failed to update field ${error.message}`);
                        return;
                }

                return data as Field;
        }

        async fetchEntry(id: number): Promise<Entry | undefined> {
                const { data, error } = await this.client
                        .from('entry_with_field')
                        .select('*')
                        .eq('id', id)
                        .single();
                if (error) {
                        console.warn(`Failed to fetch entry ${error.message}`);
                        return;
                }

                return data as Entry;
        }

        async fetchEntries(boardId: number, { fieldId, index }: { fieldId?: number; index?: number } = {}): Promise<Entry[]> {
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

                if (error) console.warn("Error fetching entries:", error);

                return data || [];
        }

        async fetchFields(boardId: number, type?: string): Promise<Field[]> {
                let query = this.client
                        .from('field')
                        .select(`id,
				name,
				type,
				date_modified,
				account_id,
				board_id,
				index`)
                        .eq('board_id', boardId);
                if (type) query = query.eq('type', type);

                const { data, error } = await query.order('index', { ascending: true });
                if (error) console.warn("Error fetching fields:", error);

                const fieldHelpersMap = await this.fetchFieldHelpers(data!.map(e => Number(e.id)));
                for (const row of data!) {
                        (row as Field).fieldHelpers = fieldHelpersMap.get(row.id);
                }

                return data || [];
        }

        async deleteField(fieldId: number): Promise<void> {
                const { error: fieldErr } = await this.client.from('field').delete().eq('id', fieldId);
                if (fieldErr) {
                        console.warn(`Failed to delete entry ${fieldErr}`);
                }
        }

        async fetchFieldHelpers(fieldIds: Array<number>): Promise<Map<number, Array<FieldHelper>>> {
                const { data, error } = await this.client
                        .from("field_helper")
                        .select("id, field_id, value")
                        .in("field_id", fieldIds);

                if (error) {
                        console.warn("Error fetching field helpers:", error);
                        return {} as Map<number, Array<FieldHelper>>;
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
        }

        async insertFieldHelper(fieldHelper: FieldHelper): Promise<FieldHelper | undefined> {
                const { data: data, error: error } = await this.client
                        .from('field_helper')
                        .insert({
                                field_id: fieldHelper.field_id,
                                value: fieldHelper.value
                        })
                        .select("id, field_id, value")
                        .single();

                if (error) {
                        console.warn(`Failed to insert fieldHelper: ${error.message}`);
                        return
                }

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

                if (error)
                        console.warn(`Failed to delete field helper values: ${error.message}`);
        }

        async insertEntries(entries: Entry[]): Promise<Array<Entry>> {
                if (!entries.length || !entries[0].board_id) {
                        console.warn("error inserting entries, board_id is null");
                }

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
                }

                return data || [];
        }

        async entryRowCount(boardId: number): Promise<number | undefined> {
                const { data: data, error: error } = await this.client
                        .from('entry')
                        .select('index')
                        .eq('board_id', boardId)
                        .order('index', { ascending: false })
                        .limit(1)
                        .single();

                if (error) {
                        console.warn("Failed to fetch entry row count");
                        return;
                }

                return data.index;
        }

        async updateEntries(entries: Entry[]): Promise<void> {
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
                                        AutomationId.AnyColumnChange,
                                        AutomationId.StatusChange
                                ]);
                        }
                        catch (e) {
                                throw e;
                        }
                }
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
                        console.log({
                                type: automation.type,
                                board_id: entry.board_id,
                                row_count: fields.length,
                                rows: objArr,
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
                if (error) console.warn("Error deleting entries:", error);
        }

        async createFieldAutomation(automation: Automation): Promise<void> {
                const { error } = await this.client.from('field_automations').insert({
                        automation_id: automation.automation_id,
                        board_id: automation.board_id,
                        field_id: automation.field_id,
                        account_id: automation.account_id,
                        url_call: automation.url_call
                });

                if (error)
                        console.warn(error);
        }

        async deleteFieldAutomation(automation: Automation): Promise<void> {
                const { error } = await this.client
                        .from('field_automations')
                        .delete()
                        .eq('board_id', automation.board_id)
                        .eq('field_id', automation.field_id)
                        .eq('automation_id', automation.automation_id)
                        .eq('url_call', automation.url_call);

                if (error)
                        console.warn(`Failed to delete automation ${error.message}`);
        }

        async accByMail(mail: string): Promise<Account | undefined> {
                const { data, error } = await this.client
                        .from('account')
                        .select('id, name, email, created_at')
                        .eq("email", mail);

                if (error) {
                        console.warn(`Failed to find account`);
                        return undefined;
                }

                return data as Account;
        }

        async addUserToBoard(mail: string, permission: number): Promise<Account | undefined> {
                const acc = await this.accByMail(mail);

                if (!acc) return;

                let { error } = await this.client
                        .from("acc_permission_link")
                        .insert({
                                account_id: acc.id,
                                permission: permission
                        })
                        .select("id, board_id, account_id, name, type, date_modified")
                        .single();

                if (error)
                        console.warn(`Failed to add user to board ${error.message}`);

                return acc;
        }

        async fetchFieldAutomations(boardId: number,
                {
                        fieldId,
                        automationIds
                }: {
                        fieldId?: number;
                        automationIds?: Array<AutomationId>
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

        async insertNotification(from: Account, to: Account, msg: string) {
                let { error } = await this.client
                        .from("notification")
                        .insert({
                                from_acc_id: from.id,
                                to_acc_id: to.id,
                                message: msg,
                        });

                if (error) console.log(error);
        }

        async setReadNotification(id: number) {
                let { error } = await this.client
                        .from("notification")
                        .update({
                                read: true
                        })
                        .eq("id", id);

                if (error) console.log(error);
        }

        async fetchNotifications(accId: number): Promise<Array<Notification>> {
                let query = this.client
                        .from('notification')
                        .select()
                        .eq('to_acc_id', accId);


                const { data, error } = await query;
                if (error) console.warn(`Failed to fetch notifications: ${error.message}`);

                return data as Array<Notification>;
        }
}
