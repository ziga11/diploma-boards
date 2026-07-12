import { supabase } from "@/core/api/supabase";
import { BoardStore } from "../board-state";

export async function fetchCollaborators() {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error(`Board ID not set`);

        return supabase.boardCollaborators(boardId);
}
