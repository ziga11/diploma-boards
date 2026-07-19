import { supabase } from "@/core/api/supabase";
import { BoardStore } from "../board-state";

export async function recoverBoard() {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Board ID not set");

        BoardStore.recoverBoard();

        return supabase.recoverBoard(boardId)
}
