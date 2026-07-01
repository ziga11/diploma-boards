import type { PermissionId } from "@/core/types/auth";

export interface InsertNotification {
        id?: string;
        from_acc_id: string;
        to_acc_id?: string;
        to_acc_email?: string;
        message: string;
        state: 'pending';
        type: 'alert' | 'invitation';
        board_id?: string;
        permission_id?: number;
}

export interface ViewNotification {
        id: string;
        from_acc: Account;
        to_acc: Account;
        direction: 'sent' | 'received';
        state: 'accepted' | 'pending' | 'dismissed' | 'declined';
        message: string;
        created_at: Date;
        permission_id?: number;
        board_id?: string;
}

export interface NotificationFetchObject {
        sent: Array<ViewNotification>;
        received: Array<ViewNotification>;
        all: Array<ViewNotification>;
}

export interface BoardCollaborator {
        account_id: string;
        name: string,
        avatar_url: string,
        email: string,
        permission_id: PermissionId;
        added_at: Date;
}
