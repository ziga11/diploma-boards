import type { Field, FieldOption } from "@/features/board/fields/types";
import { MasterRegistry } from "@/features/board/master-registry";
import { fieldsToken } from "@/features/board/fields/registry";
import { workspaceToken } from "@/features/board/workspace/registry";
import { createButtonEntry, createStatusEntry, createTextEntry } from "./utils";
import type { Entry } from "../types";
import { HTML } from "../html";
import { PermissionId } from "@/core/types/auth";

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
                element.dataset.optionId = entry.option_id;
        }

        return element;
}

export function createEntryRow(entries: Entry[]): HTMLDivElement {
        const entrySet = Object.assign(document.createElement("div"), { className: "entry-set" });
        entrySet.dataset.index = `${entries[0].index}`;

        const boardId = MasterRegistry.get(workspaceToken).getBoardId();

        const checkboxDiv = Object.assign(document.createElement("div"), { className: "entry-check-div" });
        const checkbox = Object.assign(document.createElement("input"), {
                type: "checkbox",
                className: "entry-check",
        });
        checkbox.dataset.boardId = boardId!;
        checkboxDiv.appendChild(checkbox);

        const pinDiv = Object.assign(document.createElement("div"), { className: "pin-div" });
        const pin = Object.assign(document.createElement("span"), {
                className: "pin-icon",
                innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-star">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" />
            </svg>`,
        });
        pinDiv.appendChild(pin);

        const entryDivs: HTMLElement[] = [];
        for (let i = 0; i < entries.length; i++) {
                const field = MasterRegistry.get(fieldsToken).getFieldById(entries[i].field_id!);
                entries[i].type = entries[i].type ?? field?.type;

                const divEntry = genEntry(entries[i], field?.options);
                divEntry.dataset.order = `${field?.index}`;
                divEntry.style.order = `${field?.index}`;

                entryDivs.push(divEntry);
        }

        const entriesDiv = Object.assign(document.createElement("div"), { className: "entries-div" });

        const permissionId = MasterRegistry.get(workspaceToken).getBoard()?.permission_id;
        const isMember = permissionId === PermissionId.Member;
        entriesDiv.classList.toggle("disabled", isMember);
        checkboxDiv.classList.toggle("disabled", isMember);
        entriesDiv.append(...entryDivs);

        entrySet.append(checkboxDiv, pinDiv, entriesDiv);

        return entrySet;
}

export function appendEntryRow(entries: Entry[]): HTMLDivElement {
        const row = createEntryRow(entries);
        HTML.entriesList.appendChild(row);
        return row;
}

export function appendEntryRows(entriesArr: Entry[][]): void {
        const rows = entriesArr.map(createEntryRow);
        HTML.entriesList.append(...rows);
}

export function createFieldEntries(field: Field, entryIds: Array<string>): void {
        const entriesDivs = HTML.entriesList.querySelectorAll(".entries-div") as NodeListOf<HTMLDivElement>;
        if (entriesDivs.length === 0) return;

        for (let i = 0; i < entryIds.length; i++) {
                const entry = genEntry({ id: entryIds[i], field_id: field.id, type: field.type } as Entry);
                entry.dataset.order = `${field.index}`;
                entry.style.order = `${field.index}`;

                entriesDivs[i].appendChild(entry);
        }
}
