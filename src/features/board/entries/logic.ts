import { supabase } from "@/core/api/supabase";
import type { Entry } from "./types";
import { BoardState } from "../board-state";

export function fetchPagedEntries(fieldCount: number) {
        const boardId = BoardState.boardId;
        if (!boardId) throw new Error(`Failed to fetch entries, board id not set`);

        return supabase.fetchPagedEntries(boardId, fieldCount);
}

export function firstDeepestNode(element: Element): Element {
        if (element.children.length == 0)
                return element;
        return firstDeepestNode(element.children[0]);
}

export function extractEntryValue(entryHTML: HTMLInputElement | HTMLDivElement): string {
        return (entryHTML instanceof HTMLDivElement) ? entryHTML.innerText : entryHTML.value;
}

export async function insertEmptyEntryRows(ids: Record<string, string>[]): Promise<{ entries: Entry[], row_index: number }[]> {
        return await supabase.insertEmptyEntryRows(ids);
}

export async function insertEntryRows(entryRows: Entry[][]): Promise<Array<number>> {
        return await supabase.insertEntryRows(entryRows);
}

export async function updateEntry(id: string, value: string, optionId?: string) {
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

export async function deleteRows(indices: Array<number>) {
        const acc = await supabase.getAccount();
        if (!acc) throw new Error("Failed to get the account");

        const boardId = BoardState.boardId;
        if (!boardId) throw new Error("Failed to get the boardId");

        return supabase.deleteEntryRows(boardId, indices);
}

export async function btnPress(entryId: string) {
        return supabase.btnPressAutomation(entryId);
}
