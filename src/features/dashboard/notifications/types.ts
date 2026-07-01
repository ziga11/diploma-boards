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
