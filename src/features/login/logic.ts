import { supabase } from "@/core/api/supabase";

export async function isLoggedIn(): Promise<boolean> {
        return (await supabase.getAuthUser()) != null;
}
