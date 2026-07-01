export { };

declare global {
        interface Account {
                id?: string;
                name?: string;
                created_at?: Date;
                email?: string;
                avatar_url?: string;
                last_sign_in_date?: string;
        }

        interface ApiKey {
                id: string;
                name: string;
                account_id: string;
                key: string;
                key_preview: string;
                created_at: string;
        }
}
