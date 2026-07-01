export interface HistoryLog {
        action: string,
        target_column: string,
        target_id: string,
        account_id: string,
        payload: Record<string, unknown>,
        created_at: string,
}
