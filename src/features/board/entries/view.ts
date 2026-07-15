import { PermissionId } from "@/core/types/auth";
import { BoardStore } from "../board-state";
import type { Field } from "../fields/types";
import { HTML } from "./html";
import type { Entry } from "./types";
import { changeDeepestValue, createButtonEntry, createStatusEntry, createTextEntry, setDropdownOptions } from "./view-utils";
import { bottomToolbarEvents } from "../bottom-toolbar/custom-events";
import { fieldEvents } from "../fields/custom-events";
import { extractEntryValue, firstDeepestNode } from "./logic";
import { getAccount } from "@/core/utils/utils";

export async function changeFieldEntries({ fieldId, value, oldValue }: { fieldId: string, value: string, oldValue?: string }) {
        const elems = HTML.entriesList.querySelectorAll(`[data-field-id="${fieldId}"]`) as NodeListOf<HTMLSpanElement>;

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
        const fieldChecked = BoardStore.rowCount.rendered == checkCount;

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

export function swapEntriesDOM({ field1_id, field2_id, styleSwap }: { field1_id: string, field2_id: string, styleSwap: boolean }) {
        const entries1 = HTML.entriesContainer.querySelectorAll(`.entry[data-field-id="${field1_id}"]`) as NodeListOf<HTMLDivElement>;
        const entries2 = HTML.entriesContainer.querySelectorAll(`.entry[data-field-id="${field2_id}"]`) as NodeListOf<HTMLDivElement>;

        if (!entries2 || !entries1 || entries1.length == 0) return;

        const [o1, o2] = [Number(entries1.item(0).dataset.order), Number(entries2.item(0).dataset.order)];

        /* if !styleSwap the entries's order was already swapped meaning the <> must be the opposite */
        const increase = styleSwap ? o1 > o2 : o1 < o2;

        for (let i = 0; i < entries2.length; i++) {
                const e1 = entries1[i] as HTMLElement;
                const e2 = entries2[i] as HTMLElement;

                if (increase)
                        e1.after(e2);
                else {
                        e1.before(e2);
                }

                if (styleSwap) {
                        e1.dataset.order = `${o2}`;
                        e2.dataset.order = `${o1}`;

                        e1.style.order = `${o2!}`;
                        e2.style.order = `${o1!}`;
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
                disabled: BoardStore.permissionId == PermissionId.Member
        });
        Object.assign(checkbox.dataset, { "boardId": `${BoardStore.boardId}`, });
        checkboxDiv.appendChild(checkbox);

        const pinDiv = Object.assign(document.createElement("div"), { className: "pin-div" });

        const pin = Object.assign(document.createElement("span"), {
                className: "pin-icon",
                innerHTML: `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-star">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" />
                </svg>
                `});

        pinDiv.appendChild(pin);

        const entryDivs = [];

        for (let i = 0; i < entries.length; i++) {
                const field = BoardStore.getField(entries[i].field_id!);
                entries[i].type = entries[i].type ?? field?.type;

                const divEntry = genEntry(entries[i]);
                divEntry.dataset.dbValue = entries[i].value ?? "";
                divEntry.dataset.order = `${field?.index}`;
                divEntry.style.order = `${field?.index}`;

                entryDivs.push(divEntry);
        }

        const entriesDiv = Object.assign(document.createElement("div"), {
                className: "entries-div"
        });

        entriesDiv.append(...entryDivs);

        entrySet.append(checkboxDiv, pinDiv, entriesDiv);

        return entrySet;
}

export function setEntryRows(entries: Array<Entry>, append: boolean = true) {
        const fieldCount = BoardStore.fields.size;

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
        BoardStore.setRowCount({ rendered: append ? BoardStore.rowCount.rendered + newRows : newRows });
}

export async function createEntryCopiesFromEntrySet(entrySet: HTMLDivElement): Promise<Array<Entry>> {
        let entries: Entry[] = []

        const acc = await getAccount();
        if (!acc) throw new Error("Failed to get the account");

        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Failed to get the boardId");

        BoardStore.incrementRowCount();
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
                        option_id: entryElem.dataset.optionId,
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

        const field = BoardStore.getField(fieldId)!;
        const options = field.options!;

        setDropdownOptions(options)
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

export function genEntry(entry: Entry): HTMLElement {
        let element: HTMLElement;

        if (entry.type === "status") element = createStatusEntry(entry);
        else if (entry.type === "button") element = createButtonEntry(entry);
        else element = createTextEntry(entry);

        Object.assign(element.dataset, {
                type: entry.type,
                fieldId: `${entry.field_id}`,
                entryId: `${entry.id}`,
                optionId: entry.option_id
        });

        return element;
}
