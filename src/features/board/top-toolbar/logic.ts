import { supabase } from "@/core/api/supabase";
import { BoardStore } from "../board-state";

export async function recoverBoard() {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Board ID not set");

        BoardStore.recoverBoard();

        return supabase.recoverBoard(boardId)
}

export async function updateBoard(newName: string) {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Board ID not set");

        BoardStore.setBoardTitle(newName);

        return supabase.updateBoard(boardId, newName);
}
