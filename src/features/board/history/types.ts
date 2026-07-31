export type HistoryLog = {
        id: string;
        action: string,
        target_column: string,
        target_id: string,
        account_id: string,
        account_name: string
        account_email: string
        account_avatar: string
        payload: Record<string, unknown>,
        created_at: string,
}

export type EntryLog = {
        id: string;
        field_id?: string;
        index?: string;
        value: string;
}

export enum ActionFilter {
        All = 'ALL',
        Insert = 'INSERT',
        Update = 'UPDATE',
        Delete = 'DELETE'
}

export enum ColumnFilter {
        All = 'ALL',
        Entry = 'Entry',
        Field = 'Field',
        FieldOption = 'Field Option',
        Board = 'Board',
        Automation = 'Automation',
}
