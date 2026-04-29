export interface Entry {
        id?: number;
        board_id?: number;
        index?: number;
        type?: string;
        field_id?: number;
        account_id?: number;
        date_modified?: Date;
        value: string | null;
}

export interface Account {
        id?: number;
        name?: string;
        created_at?: Date;
        email?: string;
        avatar_url?: string;
        last_sign_in_date?: string;
}

export interface Field {
        id?: number;
        board_id?: number;
        account_id?: number;
        name?: string;
        type?: string;
        date_modified?: Date;
        fieldHelpers?: Array<FieldHelper>;
}

export interface FieldHelper {
        id?: number;
        field_id?: number;
        value: string;
}

export interface Board {
        id: number;
        account_id?: number;
        color: string;
        name: string;
        date_created: Date;
}

export interface Automation {
        automation_id: AutomationId;
        board_id: number;
        field_id: number;
        account_id?: number;
        type?: string;
        date_created?: string;
        url_call: string;
}

export interface Notification {
        id: number;
        from_acc_id: number;
        to_acc_id: number;
        message: string;
        created_at: Date;
}

export interface Permission {
        automation_id: PermissionId;
        account_id: number;
        type: string;
}

export enum AutomationId {
        TextChange = 1,
        StatusChange,
        ButtonPress,
        ItemCreated,
        ItemDeleted,
        AnyColumnChange,
}

export enum PermissionId {
        View = 1,
        Change = 2,
        Automation = 3,
        All = 4
}

