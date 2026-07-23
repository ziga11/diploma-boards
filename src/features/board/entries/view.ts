import { PermissionId } from "@/core/types/auth";
import { BoardState } from "../board-state";
import type { Field, FieldOption } from "../fields/types";
import { HTML } from "./html";
import type { Entry } from "./types";
import { changeDeepestValue, createButtonEntry, createStatusEntry, createTextEntry, setDropdownOptions } from "./view-utils";
import { bottomToolbarEvents } from "../bottom-toolbar/custom-events";
import { fieldEvents } from "../fields/custom-events";
import { extractEntryValue, firstDeepestNode } from "./logic";
import { supabase } from "@/core/api/supabase";

export async function changeFieldEntries({ fieldId, value, oldValue }: { fieldId: string, value: string, oldValue?: string }) {
        const elems = HTML.entriesContainer.querySelectorAll(`[data-field-id="${fieldId}"]`) as NodeListOf<HTMLSpanElement>;

        for (const elem of elems) {
                changeDeepestValue(elem, value, oldValue);
        }
}

export function entryCheckChange(check: HTMLInputElement) {
        const checkState = check.checked;

        const entrySet = check.closest(".entry-set") as HTMLDivElement;

        const checkedInPinned = entrySet.parentElement?.className === "pinned-entry-rows";

        const index = entrySet.dataset.index;

        if (checkedInPinned) {
                const elem = HTML.entriesList.querySelector(`.entry-set[data-index="${index}"] .entry-check`) as HTMLInputElement;
                elem.checked = checkState;
        }
        else if (entrySet.classList.contains("pinned")) {
                const elem = HTML.pinnedEntriesList.querySelector(`.entry-set[data-index="${index}"] .entry-check`) as HTMLInputElement;
                elem.checked = checkState;
        }

        const checkCount = HTML.entriesList.querySelectorAll(".entry-check:checked").length;

        const visibleToolbar = checkCount > 0;
        const fieldChecked = BoardState.rowCount.rendered == checkCount;

        window.dispatchEvent(fieldEvents.checkChange(fieldChecked));
        window.dispatchEvent(bottomToolbarEvents.visible({ visible: visibleToolbar, checkedCount: checkCount }));
}

export function changeAllEntryChecks(checked: boolean) {
        const inps = Array.from(HTML.entryChecks);

        inps.forEach(inp => inp.checked = checked);

        const detailObject = { visible: checked, checkedCount: inps.length };

        window.dispatchEvent(bottomToolbarEvents.visible(detailObject));
}

export function swapEntriesVisually({ field1_id, field2_id }: { field1_id: string, field2_id: string }) {
        const entries1 = HTML.entriesContainer.querySelectorAll(`.entry[data-field-id="${field1_id}"]`) as NodeListOf<HTMLElement>;
        const entries2 = HTML.entriesContainer.querySelectorAll(`.entry[data-field-id="${field2_id}"]`) as NodeListOf<HTMLElement>;

        if (!entries2 || entries2.length == 0) return;

        for (let i = 0; i < entries1.length; i++) {
                const [e1, e2] = [entries1.item(i), entries2.item(i)];
                const [o1, o2] = [e1.dataset.order, e2.dataset.order];

                e1.dataset.order = o2;
                e2.dataset.order = o1;

                e1.style.order = o2!;
                e2.style.order = o1!;
        }
}

export function swapEntriesDOM({ field1_id, field2_id, styleSwap }: { field1_id: string; field2_id: string; styleSwap: boolean }) {
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

                        /* idk why Math.min and max approach here didnt work so ill keep this clusterfuck */
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

export function createEntryRow(entries: Array<Entry>): HTMLDivElement {
        const entrySet = Object.assign(document.createElement("div"), { className: "entry-set" });
        entrySet.dataset.index = `${entries[0].index}`;

        const checkboxDiv = Object.assign(document.createElement("div"), { className: "entry-check-div" });
        const checkbox = Object.assign(document.createElement("input"), {
                type: "checkbox",
                className: "entry-check",
        });
        checkbox.dataset.boardId = BoardState.boardId!;

        checkboxDiv.appendChild(checkbox);

        const pinDiv = Object.assign(document.createElement("div"), { className: "pin-div" });
        const pin = Object.assign(document.createElement("span"), {
                className: "pin-icon",
                innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-star">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" />
                </svg>
                `});
        pinDiv.appendChild(pin);

        const entryDivs = [];
        for (let i = 0; i < entries.length; i++) {
                const field = BoardState.getField(entries[i].field_id!);
                entries[i].type = entries[i].type ?? field?.type;

                const divEntry = genEntry(entries[i], field?.options);
                divEntry.dataset.dbValue = entries[i].value ?? "";
                divEntry.dataset.order = `${field?.index}`;
                divEntry.style.order = `${field?.index}`;

                entryDivs.push(divEntry);
        }

        const entriesDiv = Object.assign(document.createElement("div"), { className: "entries-div" });
        entriesDiv.classList.toggle("disabled", BoardState.permissionId == PermissionId.Member);
        checkboxDiv.classList.toggle("disabled", BoardState.permissionId == PermissionId.Member);
        entriesDiv.append(...entryDivs);

        entrySet.append(checkboxDiv, pinDiv, entriesDiv);

        return entrySet;
}

export function setEntryRows(entries: Array<Entry>, append: boolean = true) {
        const fieldCount = BoardState.fields.size;

        const rows = [] as Array<HTMLDivElement>;

        for (let i = 0; i < entries.length; i += fieldCount) {
                const row = createEntryRow(entries.slice(i, i + fieldCount));
                rows.push(row);
        }

        if (append) {
                HTML.entriesList.append(...rows);
        }
        else {
                HTML.entriesList.replaceChildren(...rows);
        }

        const newRows = entries.length > 0 ? entries.length / fieldCount : 0;
        BoardState.setRowCount({ rendered: append ? BoardState.rowCount.rendered + newRows : newRows });
}

export async function createEntryCopiesFromEntrySet(entrySet: HTMLDivElement): Promise<Array<Entry>> {
        let entries: Entry[] = []

        const acc = await supabase.getAccount();
        if (!acc) throw new Error("Failed to get the account");

        const boardId = BoardState.boardId;
        if (!boardId) throw new Error("Failed to get the boardId");

        BoardState.incrementRowCount();
        const entryElems = entrySet.querySelectorAll(".entry") as NodeListOf<HTMLDivElement>;

        for (const entryElem of entryElems) {
                const node = firstDeepestNode(entryElem) as HTMLInputElement | HTMLDivElement;
                const val = extractEntryValue(node);

                const entry: Entry = {
                        id: crypto.randomUUID(),
                        field_id: entryElem.dataset.fieldId,
                        value: val,
                        account_id: acc.id,
                        board_id: boardId,
                        date_modified: new Date(),
                        type: entryElem.dataset.type,
                        option_id: entryElem.dataset.optionId ?? undefined,
                };

                entries.push(entry);
        }

        return entries;
}

export function createFieldEntries(field: Field, entryIds: Array<string>) {
        const entriesDivs = HTML.entriesList.querySelectorAll(".entries-div") as NodeListOf<HTMLDivElement>;
        if (entriesDivs.length == 0) return;

        for (let i = 0; i < entryIds.length; i++) {
                const entry = genEntry({ id: entryIds[i], field_id: field.id, type: field.type } as Entry);
                entry.dataset.order = `${field.index}`;
                entry.style.order = `${field.index}`;

                entriesDivs[i].appendChild(entry);
        }
}

export function updateFieldEntries(entries: Array<Entry>, index: number) {
        if (entries.length == 0) return;

        const entrySets = HTML.entriesList.querySelectorAll(".entry-set") as NodeListOf<HTMLDivElement>;

        for (let i = 0; i < entries.length; i++) {
                const elem = entrySets.item(i).children.item(index) as HTMLElement;

                Object.assign(elem.dataset, {
                        fieldId: `${entries[i].field_id}`,
                        entryId: `${entries[i].id}`,
                });
        }
}

export function setupStatusDropdown(entryElem: HTMLDivElement) {
        const entryRect = entryElem.getBoundingClientRect();

        HTML.dropdown.menu.dataset.entryId = entryElem.dataset.entryId;

        HTML.dropdown.menu.style.left = `${entryRect.left}px`;
        HTML.dropdown.menu.style.top = `${entryRect.bottom + 2}px`;

        HTML.dropdown.menu.showModal();

        const fieldId = entryElem.dataset.fieldId;
        if (!fieldId) return;

        const field = BoardState.getField(fieldId)!;
        const options = field.options!;

        setDropdownOptions(Object.values(options))
}

export function hideMenu(e: MouseEvent): boolean {
        const rect = HTML.dropdown.menu.getBoundingClientRect();
        return (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
        );
}

export function genEntry(entry: Entry, options?: Record<string, FieldOption>): HTMLElement {
        let element: HTMLElement;

        if (entry.type === "status") element = createStatusEntry(entry, options);
        else if (entry.type === "button") element = createButtonEntry(entry, options);
        else element = createTextEntry(entry);

        Object.assign(element.dataset, {
                type: entry.type,
                fieldId: `${entry.field_id}`,
                entryId: `${entry.id}`,
        });

        if (entry.option_id) {
                element.dataset.optionId = entry.option_id
        }

        return element;
}
