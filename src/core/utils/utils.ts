import type { User } from "@supabase/supabase-js";
import { supabase } from "../api/supabase";

export async function getAccount(): Promise<Account | undefined> {
        const sessionUser = await supabase.getSessionUser();
        if (sessionUser) return userToAccount(sessionUser);
        const authUser = await supabase.getAuthUser();
        if (authUser) return userToAccount(authUser);
}

function userToAccount(user: User): Account {
        const acc = {
                id: user.id,
                avatar_url: user.user_metadata.avatar_url,
                email: user.user_metadata.email,
                name: user.user_metadata.name,
                last_sign_in_date: user.user_metadata.last_sign_in_at,
        } as Account;

        return acc;
}

export function sanitizeHTML(strings: TemplateStringsArray, ...values: any[]): string {
        const escape = (str: string) =>
                String(str)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#x27;');

        return strings.reduce((result, str, i) => {
                const value = values[i] !== undefined ? escape(values[i]) : '';
                return result + str + value;
        }, '');
}

export function createUUID() {
        return crypto.randomUUID();
}
