import { supabase } from "@/core/api/supabase";
import { BoardStore } from "../board-state";
import type { HistoryLog } from "./types";


export async function fetchHistory(): Promise<Array<HistoryLog>> {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error(`Board ID not set`);

        return supabase.fetchHistory();
}

export async function fetchCollaborators() {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error(`Board ID not set`);

        return supabase.boardCollaborators(boardId);
}
