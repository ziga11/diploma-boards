import { supabase } from "@/core/api/supabase";

export function boardLink(boardId: string) {
        return `/board?board_id=${boardId}`;
}

export async function logOut() {
        return supabase.signOut();
}

export async function fetchBoards() {
        return supabase.fetchBoards();
}
