import { supabase } from "@/core/api/supabase";
import { BoardState } from "../board-state";

export async function fetchCollaborators() {
        const boardId = BoardState.boardId;
        if (!boardId) throw new Error(`Board ID not set`);

        return supabase.fetchCollaborators(boardId);
}
