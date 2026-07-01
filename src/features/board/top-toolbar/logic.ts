import { supabase } from "@/core/api/supabase";
import { BoardStore } from "../board-state";
import { getAccount } from "@/core/utils/utils";

export async function deleteBoard() {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Board ID not set");

        return supabase.deleteBoard(boardId)
}

export async function leaveBoard() {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Board ID not set");

        const acc = await getAccount();
        if (!acc) throw new Error("Account was not set");

        return supabase.kickCollaborator(acc.id!, boardId);
}

export async function updateBoard(newName: string) {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Board ID not set");

        BoardStore.setBoardTitle(newName);

        return supabase.updateBoard(boardId, newName);
}
