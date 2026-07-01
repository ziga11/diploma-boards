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

export async function changeFieldEntries({ fieldId, value }: { fieldId: string, value: string }) {
        const elems = HTML.entryDiv.querySelectorAll(`[data-field-id="${fieldId}"]`) as NodeListOf<HTMLSpanElement>;

        for (const elem of elems) {
                changeDeepestValue(elem, value);
        }
}

export function entryCheckChange() {
        const checked = document.querySelectorAll(".entry-check:checked").length;

        const visibleToolbar = checked > 0;
        const fieldChecked = BoardStore.rowCount == checked;

        window.dispatchEvent(fieldEvents.checkChange(fieldChecked));
        window.dispatchEvent(bottomToolbarEvents.visible({ visible: visibleToolbar, checkedCount: checked }));
}

export function changeAllEntryChecks(checked: boolean) {
        const inps = Array.from(HTML.entryChecks);

        inps.forEach(inp => inp.checked = checked);

        const detailObject = { visible: checked, checkedCount: BoardStore.rowCount };

        window.dispatchEvent(bottomToolbarEvents.visible(detailObject));
}

export function swapEntriesVisually({ startIndex, finalIndex }: { startIndex: number, finalIndex: number }) {
        const entries1 = HTML.entryDiv.querySelectorAll(`.entry[data-order="${startIndex}"]`) as NodeListOf<HTMLDivElement>;
        const entries2 = HTML.entryDiv.querySelectorAll(`.entry[data-order="${finalIndex}"]`) as NodeListOf<HTMLDivElement>;

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

export function swapEntriesDOM({ finalIndex, increase }: { finalIndex: number, increase: boolean }) {
        const entries1 = HTML.entryDiv.querySelectorAll(`.entry[data-order="${finalIndex}"]`) as NodeListOf<HTMLDivElement>;
        const otherIndex = increase ? finalIndex - 1 : finalIndex + 1;

        const entries2 = HTML.entryDiv.querySelectorAll(`.entry[data-order="${otherIndex}"]`) as NodeListOf<HTMLDivElement>;
        if (!entries2 || !entries1 || entries1.length == 0) return;

        for (let i = 0; i < entries2.length; i++) {
                const e1 = entries2[i] as HTMLElement;
                const e2 = entries1[i] as HTMLElement;

                if (increase)
                        e1.after(e2);
                else {
                        e1.before(e2);
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
        Object.assign(checkbox.dataset, {
                "boardId": `${BoardStore.boardId}`,
                "index": `${entries[0].index}`,
        });

        checkboxDiv.appendChild(checkbox);

        const entryDivs = [];

        for (let i = 0; i < entries.length; i++) {
                const field = BoardStore.getField(entries[i].field_id!);
                entries[i].type = entries[i].type ?? field?.type;

                const divEntry = genEntry(entries[i]);
                divEntry.dataset.dbValue = entries[i].value ?? "";
                divEntry.dataset.order = `${i + 1}`;
                divEntry.style.order = `${i + 1}`;

                entryDivs.push(divEntry);
        }

        entrySet.append(checkboxDiv, ...entryDivs);

        return entrySet;
}

export async function createEntryCopiesFromEntrySet(entrySets: NodeListOf<HTMLDivElement>): Promise<Array<Entry>> {
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
                                id: crypto.randomUUID(),
                                field_id: child.dataset.fieldId,
                                value: val,
                                account_id: acc.id,
                                board_id: boardId,
                                index: rowCount + 1,
                                date_modified: new Date(),
                                type: child.dataset.type,
                        };

                        entries.push(entry);
                }
                rowCount++;
        }

        return entries;
}

export function createFieldEntries(field: Field, entryIds: Array<string>) {
        const entrySets = HTML.entryDiv.querySelectorAll(".entry-set") as NodeListOf<HTMLDivElement>;
        if (entrySets.length == 0) return;

        const index = entrySets.item(0).children.length;

        for (let i = 0; i < entryIds.length; i++) {
                const entry = genEntry({ id: entryIds[i], field_id: field.id, type: field.type } as Entry);
                entry.dataset.order = `${index}`;
                entry.style.order = `${index}`;

                entrySets[i].appendChild(entry);
        }
}

export function updateFieldEntries(entries: Array<Entry>, index: number) {
        if (entries.length == 0) return;

        const entrySets = HTML.entryDiv.querySelectorAll(".entry-set") as NodeListOf<HTMLDivElement>;

        for (let i = 0; i < entries.length; i++) {
                const elem = entrySets.item(i).children.item(index) as HTMLElement;
                console.log(elem);


                Object.assign(elem.dataset, {
                        fieldId: `${entries[i].field_id}`,
                        entryId: `${entries[i].id}`,
                });
        }
}

export function setupDropdown(entryElem: HTMLDivElement) {
        const entryRect = entryElem.getBoundingClientRect();

        HTML.dropdown.menu.dataset.entryId = entryElem.dataset.entryId;

        HTML.dropdown.menu.style.left = `${entryRect.left}px`;
        HTML.dropdown.menu.style.top = `${entryRect.bottom + 2}px`;

        HTML.dropdown.menu.showModal();

        const fieldId = entryElem.dataset.fieldId;
        if (!fieldId) return;
        setDropdownOptions(fieldId)
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
        });

        return element;
}
