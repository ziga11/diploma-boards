import { HTML } from "../html";
import type { Entry } from "../types";
import { setStateClass } from "@/core/utils/dom";
import { setValueToEntries } from "../logic/entry-layout";

export function clearEntries(): void {
        clearListedEntries();
        clearPinnedEntries();
}

export function clearListedEntries(): void {
        HTML.entriesList.innerHTML = "";
}

export function clearPinnedEntries(): void {
        HTML.pinnedEntriesList.innerHTML = "";
}

export function setRowIndex(row: HTMLDivElement, index: number): void {
        row.dataset.index = `${index}`;
}

export function setOptionIdsToEntryRow(row: HTMLDivElement, entries: Entry[]): void {
        entries.forEach(e => {
                if (e.option_id) {
                        const elem = row.querySelector(`[data-entry-id="${e.id!}"]`) as HTMLElement;
                        if (elem) elem.dataset.optionId = e.option_id;
                }
        });
}

export function setEntryValue(elem: HTMLElement, value: string): void {
        const type = elem.dataset.type;
        if (type === "button" || type === "status") {
                elem.innerText = value;
        } else {
                (elem as HTMLInputElement).value = value;
        }
}

export function setValueToEntriesById(id: string, value?: string, optionId?: string): void {
        const elems = HTML.entriesContainer.querySelectorAll(`.entry[data-entry-id="${id}"]`) as NodeListOf<HTMLDivElement | HTMLInputElement>;
        setValueToEntries(elems, value, optionId);
}

export async function changeFieldEntries({ fieldId, value, oldValue }: { fieldId: string; value: string; oldValue?: string }): Promise<void> {
        const selector = oldValue !== undefined
                ? `[data-field-id="${fieldId}"][data-db-value="${oldValue}"]`
                : `[data-field-id="${fieldId}"]`;
        const elems = HTML.entriesContainer.querySelectorAll(selector) as NodeListOf<HTMLSpanElement>;

        setValueToEntries(elems, value);
}

export function removeFieldEntries(fieldId: string): void {
        const entries = HTML.entriesContainer.querySelectorAll(`[data-field-id="${fieldId}"]`) as NodeListOf<HTMLDivElement>;
        entries.forEach(e => e.remove());
}

export function updateFieldEntries(entries: Array<Entry>, index: number): void {
        if (entries.length === 0) return;

        const entrySets = HTML.entriesList.querySelectorAll(".entry-set") as NodeListOf<HTMLDivElement>;

        for (let i = 0; i < entries.length; i++) {
                const elem = entrySets.item(i).children.item(index) as HTMLElement;
                Object.assign(elem.dataset, {
                        fieldId: `${entries[i].field_id}`,
                        entryId: `${entries[i].id}`,
                });
        }
}

export function swapEntriesVisually({ field1_id, field2_id }: { field1_id: string; field2_id: string }): void {
        const entries1 = HTML.entriesContainer.querySelectorAll(`.entry[data-field-id="${field1_id}"]`) as NodeListOf<HTMLElement>;
        const entries2 = HTML.entriesContainer.querySelectorAll(`.entry[data-field-id="${field2_id}"]`) as NodeListOf<HTMLElement>;

        if (!entries2 || entries2.length === 0) return;

        for (let i = 0; i < entries1.length; i++) {
                const [e1, e2] = [entries1.item(i), entries2.item(i)];
                const [o1, o2] = [e1.dataset.order, e2.dataset.order];

                e1.dataset.order = o2;
                e2.dataset.order = o1;

                e1.style.order = o2!;
                e2.style.order = o1!;
        }
}

export function swapEntriesDOM({ field1_id, field2_id, styleSwap }: { field1_id: string; field2_id: string; styleSwap: boolean }): void {
        const entries1 = HTML.entriesContainer.querySelectorAll<HTMLDivElement>(`.entry[data-field-id="${field1_id}"]`);
        const entries2 = HTML.entriesContainer.querySelectorAll<HTMLDivElement>(`.entry[data-field-id="${field2_id}"]`);

        if (!entries1.length || !entries2.length) return;

        const o1 = Number(entries1[0].dataset.order);
        const o2 = Number(entries2[0].dataset.order);

        for (let i = 0; i < entries1.length; i++) {
                const e1 = entries1[i];
                const e2 = entries2[i];

                if (!e1 || !e2) continue;

                const parent = e1.parentElement;
                if (!parent) continue;

                const children = Array.from(parent.children);
                const e1Index = children.indexOf(e1);
                const e2Index = children.indexOf(e2);

                if (e1Index < e2Index) {
                        e2.after(e1);
                } else {
                        e2.before(e1);
                }

                if (styleSwap) {
                        const rowEntries = entries1[i].closest(".entries-div") as HTMLDivElement;
                        const increase = o2 > o1;
                        const startIndex = increase ? o1 + 1 : o1 - 1;

                        for (let j = startIndex; increase ? j <= o2 : j >= o2; increase ? j++ : j--) {
                                const entry = rowEntries.children.item(j) as HTMLElement;
                                const currOrder = Number(entry.dataset.order);
                                const newOrder = currOrder + (increase ? -1 : 1);
                                entry.dataset.order = `${newOrder}`;
                                entry.style.order = `${newOrder}`;
                        }

                        e1.dataset.order = `${o2}`;
                        e1.style.order = `${o2}`;
                }
        }
}

export function togglePin(entrySet: HTMLDivElement): void {
        const container = entrySet.parentElement as HTMLDivElement;
        const rowIndex = entrySet.dataset.index;

        entrySet.classList.toggle("pinned");

        if (container === HTML.entriesList) {
                const pinnedEntrySet = HTML.pinnedEntriesList.querySelector(`[data-index="${rowIndex}"]`) as HTMLDivElement;
                if (pinnedEntrySet) {
                        pinnedEntrySet.remove();
                } else {
                        const copiedEntrySet = entrySet.cloneNode(true) as HTMLDivElement;
                        HTML.pinnedEntriesList.appendChild(copiedEntrySet);
                }
        } else {
                const entrySetInList = HTML.entriesList.querySelector(`[data-index="${rowIndex}"]`) as HTMLDivElement;
                entrySetInList.classList.toggle("pinned");
                entrySet.remove();
        }
}

export function setEntryRowVisibility({ row, visible }: { row: HTMLDivElement; visible: boolean }): void {
        row.style.display = visible ? "flex" : "none";
}

export function setEntryVisibility(entries: Element[], visible: boolean): void {
        const entriesArr = Array.from(entries);
        if (visible) {
                setStateClass([], entries, "hidden");
        } else {
                setStateClass(entriesArr, [], "hidden");
        }
}

export function getEntryRowsByIndices(indices: number[], pinned: boolean = true): NodeListOf<HTMLDivElement> {
        if (indices.length === 0) return [] as unknown as NodeListOf<HTMLDivElement>;
        const selector = indices.map(i => `.entry-set[data-index="${i}"]`).join(", ");

        return (pinned
                ? HTML.entriesContainer.querySelectorAll(selector)
                : HTML.entriesList.querySelectorAll(selector)) as NodeListOf<HTMLDivElement>;
}

export function removeEntryRows(entryRows: NodeListOf<HTMLDivElement> | HTMLDivElement[]): void {
        entryRows.forEach(er => er.remove());
}
