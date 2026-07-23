import { supabase } from "@/core/api/supabase";
import { BoardState } from "../board-state";

export async function recoverBoard() {
        const boardId = BoardState.boardId;
        if (!boardId) throw new Error("Board ID not set");

        BoardState.recoverBoard();

        return supabase.recoverBoard(boardId)
}
