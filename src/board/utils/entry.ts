import { Globals } from "../../globals";
import { AutomationId, PermissionId, type Entry } from "../../types";
import { showToast } from "../../utils";
import { dropdownOptionSelected, entryBlur } from "../events/entry/utils";
import { boardElements, bottomToolbar } from "../types";

export async function createEntries() {
        const entries = await Globals.supabase.fetchEntries(Globals.board!.id) as Array<Entry>;
        const fields = boardElements.fieldsDiv.querySelectorAll(".field-div");

        for (let i = 0; i < entries.length; i += fields.length) {
                createEntryRow(entries.slice(i, i + fields.length));
        }
}

export async function createEntryRow(entries: Entry[]) {
        const entrySet = Object.assign(document.createElement("div"), {
                className: "entry-set",
                id: `entry-set-${entries[0].index}`,
        });

        const checkboxDiv = Object.assign(document.createElement("div"), {
                className: "entry-check-div"
        });

        const checkbox = Object.assign(document.createElement("input"), {
                type: "checkbox",
                className: "entry-check",
                disabled: Globals.board?.permission_id == PermissionId.Member
        });
        Object.assign(checkbox.dataset, {
                "boardId": `${Globals.board!.id}`,
                "index": `${entries[0].index}`,
        });

        const fieldDiv = boardElements.fieldsDiv;

        checkbox.addEventListener("change", () => {
                const entryBoxesSelected = document.querySelectorAll(".entry-check:checked").length;
                bottomToolbar.numEntriesDiv.innerText = `${entryBoxesSelected}`;

                if (entryBoxesSelected == boardElements.entryChecks.length) {
                        boardElements.fieldCheck.checked = true;
                        bottomToolbar.outerDiv.classList.add("shown");
                        return;
                }
                else if (entryBoxesSelected > 0) {
                        boardElements.fieldCheck.checked = false;
                        bottomToolbar.outerDiv.classList.add("shown");
                }
                else {
                        boardElements.fieldCheck.checked = false;
                        bottomToolbar.outerDiv.classList.remove("shown");
                }
        });

        checkboxDiv.appendChild(checkbox);
        entrySet.appendChild(checkboxDiv);
        const fieldDivs = fieldDiv.querySelectorAll(".field-div") as NodeListOf<HTMLDivElement>;

        for (let i = 0; i < entries.length; i++) {
                entries[i].type = entries[i].type ?? fieldDivs[i].dataset.type;

                const divEntry = genEntry(entries[i]);
                divEntry.dataset.order = `${i + 1}`;
                entrySet.appendChild(divEntry);
        }

        boardElements.entriesDiv.appendChild(entrySet);
}

function createSVGIcon(classnames: string[], pathD: string): SVGSVGElement {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const attributes = {
                width: "16",
                height: "16",
                fill: "currentColor",
                viewBox: "0 0 16 16"
        };
        Object.entries(attributes).forEach(([name, value]) => {
                svg.setAttribute(name, value);
        });

        svg.classList.add(...classnames);
        svg.innerHTML = `<path d="${pathD}" />`;
        return svg;
}

export function createAddOption() {
        const div = document.createElement("div") as HTMLDivElement;

        const input = Object.assign(document.createElement("input"), {
                type: "text",
                value: "Add",
                className: "custom-option-input",
        })

        const checkIcon = createSVGIcon(["bi", "bi-check-square-fill"],
                "M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z"
        );

        div.append(input, checkIcon);

        return div;
}

export function createOption(entry: Entry, HTMLElemEntry: HTMLDivElement, optionText: string): HTMLDivElement {
        const div = Object.assign(document.createElement("div"), {
                className: "dropdown-option",
        });

        const span = Object.assign(document.createElement("span"), {
                innerText: optionText,
                className: "dropdown-option-input",
        })


        div.addEventListener("click", () => dropdownOptionSelected(div, optionText, entry, HTMLElemEntry));

        div.append(span);
        return div;
}

export async function changeAffectedEntries(field_id: number, currValue: string, newValue: string) {
        const fieldEntries = document.querySelectorAll(`[data-field-id="${field_id}"]`) as NodeListOf<HTMLDivElement>;

        let entries: Array<Entry> = [];
        for (const elem of fieldEntries) {
                if (elem.textContent !== currValue) continue;
                elem.textContent = newValue;

                const entryId = elem.dataset.id!.split("-")[1];
                entries.push({
                        board_id: Globals.board?.id,
                        value: newValue,
                        id: Number(entryId)
                } as Entry);
        }
        try {
                await Globals.supabase.updateEntries(entries);
        }
        catch (e) {
                alert(e);
        }
}

function setDropdownOptions(entry: Entry, entryHTMLElem: HTMLDivElement): HTMLDivElement {
        const div = document.querySelector(".dropdown-menu") as HTMLDivElement;

        let createdOptions: Array<Node> = [];

        const field = Globals.fields.get(entry.field_id!)!;

        for (const fieldHelper of field.fieldHelpers ?? []) {
                createdOptions.push(createOption(entry, entryHTMLElem, fieldHelper.value));
        }

        Globals.activeDropdown.entry = entry;
        Globals.activeDropdown.elem = entryHTMLElem;

        const emptyOption = document.createElement("div")
        emptyOption.innerHTML = `<div id="empty-option" class="dropdown-option" style="opacity: 0.7;"><span>Empty</span></div>`;
        emptyOption.addEventListener("click", () => dropdownOptionSelected(emptyOption, "", entry, entryHTMLElem));

        div.replaceChildren(...createdOptions, emptyOption);
        return div;
}

export function statusEntry(entry: Entry): HTMLDivElement {
        const element = Object.assign(document.createElement("div"), {
                className: "entry",
                innerText: entry.value ?? "",
                title: entry.value ?? "",
                id: `entry-${entry.id}`,
        })

        let optionsDiv = document.querySelector(".dropdown-menu") as HTMLDivElement;

        element.addEventListener("click", (e) => {
                e.stopPropagation();

                optionsDiv = setDropdownOptions(entry, element);

                if (optionsDiv.classList.contains("shown")) {
                        optionsDiv.classList.remove("shown");
                        optionsDiv.classList.remove("add");
                        return;
                }

                optionsDiv.classList.add("shown");
                optionsDiv.dataset.entryId = `${entry.id}`;

                const entryRect = element.getBoundingClientRect();
                optionsDiv.style.left = entryRect.left + "px";
                optionsDiv.style.top = (entryRect.top + entryRect.height) + "px";
        });

        document.addEventListener("click", (e) => {
                if (!optionsDiv.classList.contains("shown")) return;
                if (e.x < parseInt(optionsDiv.style.left) || e.x > parseInt(optionsDiv.style.left) + optionsDiv.offsetWidth ||
                        e.y < parseInt(optionsDiv.style.top) || e.y > parseInt(optionsDiv.style.top) + optionsDiv.offsetHeight) {
                        optionsDiv.classList.remove("shown");
                        optionsDiv.classList.remove("add");
                }
        });

        return element;
}

export function buttonEntry(entry: Entry): HTMLDivElement {
        const div = Object.assign(document.createElement("div"), {
                className: "entry-btn-div",
        });

        const btn = Object.assign(document.createElement("button"), {
                type: "button",
                className: "btn-entry"
        });

        const field = Globals.fields.get(entry.field_id!);
        const fieldHelper = field?.fieldHelpers?.at(0);

        const span = Object.assign(document.createElement("span"), {
                innerText: fieldHelper?.value ?? "",
                title: fieldHelper?.value ?? "",
                contentEditable: "false",
        });


        btn.addEventListener("click", () => {
                Globals.supabase.triggerAutomation({
                        board_id: Globals.board?.id,
                        field_id: entry.field_id,
                        value: entry.value,
                        id: entry.id,
                        index: entry.index,
                } as Entry, [AutomationId.ButtonPress])
                        .then((triggered) => triggered ? showToast("Automation triggered successfully", boardElements.toastContainer) : null)
                        .catch((e) => showToast(`Automation unsuccessful ${e.message || e}`, boardElements.toastContainer, "error"));
        });

        btn.appendChild(span);
        div.appendChild(btn);

        return div;
}

export function textEntry(entry: Entry): HTMLInputElement {
        return Object.assign(document.createElement('input'), {
                className: "entry",
                type: entry.type!,
                value: entry.value ?? "",
                title: entry.value ?? "",
        })
}

export function genEntry(entry: Entry) {
        let element: HTMLDivElement | HTMLInputElement | HTMLButtonElement;
        if (entry.type === "status") {
                element = statusEntry(entry);
        }
        else if (entry.type === "button") {
                element = buttonEntry(entry);
        }
        else {
                element = textEntry(entry);
        }
        Object.assign(element.dataset, { "fieldId": entry.field_id });

        element.addEventListener("blur", async (ev: Event) => entryBlur(ev, entry));

        return element;
}

/** Creates entries for a specific field */
export async function createFieldEntries(entries: Array<Entry>) {
        const entrySets = document.querySelectorAll(".entry-set") as NodeListOf<HTMLDivElement>;

        if (entrySets.length == 0) return;

        const index = entrySets[0].children.length;

        for (let i = 0; i < entrySets.length; i++) {
                const entry = genEntry(entries[i]);
                entry.dataset.order = `${index}`;
                entrySets[i].appendChild(entry);
        }
}
