import { supabase } from "@/core/api/supabase";
import type { Entry } from "./types";
import { BoardStore } from "../board-state";
import { getAccount } from "@/core/utils/utils";
import { AutomationId } from "../automations/types";

export async function fetchEntries() {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error(`Failed to fetch entries, board id not set`);

        return supabase.fetchEntries(boardId);
}

export function firstDeepestNode(element: Element): Element {
        if (element.children.length == 0)
                return element;
        return firstDeepestNode(element.children[0]);
}

export function extractEntryValue(entryHTML: HTMLInputElement | HTMLDivElement): string {
        return (entryHTML instanceof HTMLDivElement) ? entryHTML.innerText : entryHTML.value;
}

export async function insertEntrySetCopies(entrySets: NodeListOf<HTMLDivElement>): Promise<void> {
        let entries: Entry[] = []

        const acc = await getAccount();
        if (!acc) throw new Error("Failed to get the account");

        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Failed to get the boardId");

        let rowCount = BoardStore.rowCount;
        for (const entrySet of entrySets) {
                const children = entrySet.children;
                for (let i = 1; i < children.length; i++) {
                        const child = children.item(i) as HTMLElement;
                        const node = firstDeepestNode(child) as HTMLInputElement | HTMLDivElement;
                        const val = extractEntryValue(node);

                        const entry: Entry = {
                                field_id: child.dataset.fieldId,
                                value: val,
                                account_id: acc.id,
                                board_id: boardId,
                                index: rowCount + 1,
                        };

                        entries.push(entry);
                }
                rowCount++;
        }

        return await supabase.insertEntryRows(entries);
}

export async function insertEntries(entries: Array<Entry>): Promise<void> {
        return await supabase.insertEntryRows(entries);
}

export async function updateEntry(id: string, value: string) {
        const acc = await getAccount();
        if (!acc) throw new Error("Failed to get the account");

        return await supabase.updateEntry({ value, id });
}

export async function deleteRows(indicies: number[]) {
        const acc = await getAccount();
        if (!acc) throw new Error("Failed to get the account");

        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Failed to get the boardId");

        return supabase.deleteEntryRows(boardId, indicies);
}

export async function triggerAutomation(automationIds: AutomationId[], { entry, fieldId, entryId, rowIndex }: {
        entryId?: string, boardId?: string, fieldId?: string, rowIndex?: number, entry?: Entry
}) {
        const boardId = BoardStore.boardId;
        if (!boardId) return;

        return supabase.triggerAutomation(automationIds, { entry, boardId, fieldId, entryId, rowIndex });
}
