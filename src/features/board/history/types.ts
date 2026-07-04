export interface HistoryLog {
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
