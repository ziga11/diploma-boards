import { supabase } from "@/core/api/supabase";
import type { Entry } from "../types";
import { MasterRegistry } from "@/features/board/master-registry";
import { workspaceToken } from "@/features/board/workspace/registry";
import { DBToEntry } from "./entry-actions";

export async function insertEmptyEntryRowsDB(ids: Record<string, string>[]): Promise<{ entries: Entry[], row_index: number }[]> {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("BoardId not set");

        const rows = await supabase.insertEmptyEntryRows(boardId, ids);

        return rows.map(row => ({
                ...row,
                entries: row.entries.map(DBToEntry),
        }));
}

export async function insertEntryRowsDB(entryRows: Entry[][]): Promise<number[]> {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error(`Failed to fetch entries, board id not set`);

        return await supabase.insertEntryRows(boardId, entryRows);
}

export async function updateEntryDB(id: string, value: string, optionId?: string) {
        const acc = await supabase.getAccount();
        if (!acc) throw new Error("Failed to get the account");

        let payload = { id } as any;
        if (optionId) {
                payload.optionId = optionId;
        }
        else {
                payload.value = value;
        }

        return await supabase.updateEntry(payload);
}

export async function deleteRowsDB(indices: number[]) {
        const acc = await supabase.getAccount();
        if (!acc) throw new Error("Failed to get the account");

        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("Failed to get the boardId");

        return supabase.deleteEntryRows(boardId, indices);
}

export async function btnPressDB(entryId?: string) {
        if (!entryId) return;

        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("Board ID not set");

        return supabase.triggerButtonAutomation(boardId, entryId);
}
