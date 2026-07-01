import { supabase } from "@/core/api/supabase";

export async function insertAPIKey(id: string, name: string): Promise<ApiKey> {
        return supabase.genApiKey(id, name);
}

export async function fetchAPIKeys(): Promise<Array<ApiKey>> {
        return supabase.fetchApiKeys();
}

export async function deleteAPIKey(id: string) {
        return supabase.removeApiKey(id);
}
