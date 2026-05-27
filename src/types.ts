export interface Entry {
        id?: number;
        board_id?: number;
        value: string | null;
        date_modified?: Date;
        index?: number;
        type?: string;
        field_id?: number;
        account_id?: string;
}

export interface Account {
        id?: string;
        name?: string;
        created_at?: Date;
        email?: string;
        avatar_url?: string;
        last_sign_in_date?: string;
}

export interface Field {
        id?: number;
        board_id?: number;
        account_id?: string;
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

export interface InsertBoard {
        id: number;
        account_id?: string;
        color: string;
        name: string;
        created_at: Date;
}

export interface ViewBoard {
        id: number;
        account_id?: string;
        color: string;
        name: string;
        date_created: Date;
        permission_id: number;
        is_owner: boolean;
}

export interface BoardCollaborator {
        account_id: string;
        name: string,
        avatar_url: string,
        email: string,
        permission_id: PermissionId;
        added_at: Date;
}

export interface BoardFetchObject {
        owner: Array<ViewBoard>,
        other: Array<ViewBoard>,
        all: Array<ViewBoard>
}

export interface Automation {
        automation_id: AutomationId;
        board_id: number;
        field_id?: number;
        account_id?: string;
        type?: string;
        date_created?: string;
        url_call: string;
}

export interface ApiKey {
        id: number;
        name: string;
        account_id: string;
        key: string;
        key_preview: string;
        created_at: string;
}

export interface InsertNotification {
        id?: number;
        from_acc_id: string;
        to_acc_id?: string;
        to_acc_email?: string;
        message: string;
        state: 'pending';
        type: 'alert' | 'invitation';
        board_id?: number;
        permission_id?: number;
}

export interface ViewNotification {
        id: number;
        from_acc: Account;
        to_acc: Account;
        direction: 'sent' | 'received';
        state: 'accepted' | 'pending' | 'dismissed' | 'declined';
        message: string;
        created_at: Date;
        permission_id?: number;
        board_id?: number;
}

export interface NotificationFetchObject {
        sent: Array<ViewNotification>;
        received: Array<ViewNotification>;
        all: Array<ViewNotification>;
}

export interface Permission {
        automation_id: PermissionId;
        account_id: string;
        type: string;
}

export enum AutomationId {
        TextChange = 1,
        StatusChange,
        ButtonPress,
        ItemCreated,
        ItemDeleted,
        AnyFieldChange,
}

export enum PermissionId {
        Member = 1,
        Editor = 2,
        Manager = 3,
        Admin = 4
}
