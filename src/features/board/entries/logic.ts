import { supabase } from "@/core/api/supabase";
import type { Entry } from "./types";
import { BoardStore } from "../board-state";
import { AutomationId } from "../automations/types";
import { HTML } from "./html";
import { changeDeepestValue } from "./view-utils";

export function fetchPagedEntries(fieldCount: number) {
        const boardId = BoardStore.boardId;
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

export async function insertEmptyEntryRows(ids: Array<string>): Promise<Array<number>> {
        return await supabase.insertEmptyEntryRows(ids);
}

export async function insertEntryRows(entryRows: Array<Array<Entry>>): Promise<Array<number>> {
        return await supabase.insertEntryRows(entryRows);
}

export async function updateEntry(id: string, value: string, optionId?: string) {
        const acc = await supabase.getAccount();
        if (!acc) throw new Error("Failed to get the account");

        const elems = HTML.entriesContainer.querySelectorAll(`.entry[data-entry-id="${id}"]`) as NodeListOf<HTMLElement>;

        if (elems.length > 1) {
                for (const elem of elems) changeDeepestValue(elem, value);
        }

        const elem = elems[0];
        const index = (elem.closest(".entry-set") as HTMLDivElement).dataset.index;
        const entry = {
                id: elem.dataset.entryId,
                type: elem.dataset.type,
                field_id: elem.dataset.fieldId,
                index: index,
        } as Entry;

        supabase.triggerAutomation([
                entry.type == "text" ? AutomationId.TextChange : AutomationId.StatusChange,
                AutomationId.AnyFieldChange,
        ], { entry });

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

        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Failed to get the boardId");

        return supabase.deleteEntryRows(boardId, indices);
}

export async function triggerAutomation(automationIds: AutomationId[], { entry, fieldId, entryId, rowIndex }: {
        entryId?: string, boardId?: string, fieldId?: string, rowIndex?: number, entry?: Entry
}) {
        return supabase.triggerAutomation(automationIds, { entry, fieldId, entryId, rowIndex });
}
