import { supabase } from "@/core/api/supabase";

export async function isLoggedIn(): Promise<boolean> {
        try {
                await supabase.getAccount();
                return true;
        }
        catch (_) {
                return false;
        }
}
