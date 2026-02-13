import { buttonEntryBlur, buttonEntryPress, changeAffectedEntries, columnInputBlur, confirmOptionEdit, deleteAutomation, deleteField, dropdownOptionSelected, editOption, entryBlur } from "./events.ts";
import { Globals } from "../globals.ts";
import { AutomationId, type Automation, type Entry, type Field, type FieldHelper } from "../types.ts";
import { automationElements, boardElements, bottomToolbar } from "./types.ts";

export function setStateClass(addTo: Array<Element>, removeFrom: Array<Element>, state: string) {
        addTo.forEach((elem) => {
                elem.classList.add(state);
        });
        removeFrom.forEach((elem) => {
                elem.classList.remove(state);
        });
}

export function setAutomationSection(section: HTMLDivElement | null) {
        automationElements.createAutomations.classList.remove("shown");
        automationElements.fieldSelection.classList.remove("shown");
        automationElements.urlCallDiv.classList.remove("shown");
        automationElements.createdAutomations.classList.remove("shown");

        if (section)
                section.classList.add("shown");
}

export function firstDeepestNode(element: Element): Element {
        if (element.children.length == 0)
                return element;
        return firstDeepestNode(element.children[0]);
}

function extractEntryValue(entryHTML: HTMLInputElement | HTMLButtonElement | HTMLDivElement): string {
        if (entryHTML instanceof HTMLDivElement) return entryHTML.innerText;
        return entryHTML.type === "date" ? entryHTML.value : entryHTML.value + " copy";
}

export async function copyEntrySet(entrySet: HTMLDivElement, boardId: number): Promise<Array<Entry>> {
        const entrySetChildren = Array.from(entrySet.children).slice(1) as Array<HTMLElement>;

        console.log(entrySetChildren);

        let entries: Entry[] = []

        const rowCount = boardElements.entryChecks.length;
        for (const child of entrySetChildren) {
                const val = extractEntryValue(firstDeepestNode(child) as HTMLInputElement | HTMLButtonElement | HTMLDivElement)

                const entry: Entry = {
                        field_id: Number(child.dataset.fieldId),
                        value: val,
                        account_id: Globals.account?.id,
                        board_id: boardId,
                        index: rowCount + 1,
                };

                entries.push(entry);
        }

        return await Globals.supabase.insertEntries(entries);
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

        let beforeEditVal: string;

        const checkIcon = createSVGIcon(["bi", "bi-check-square-fill"],
                "M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z"
        );
        checkIcon.setAttribute("title", "confirm");
        checkIcon.addEventListener("click", (e: MouseEvent) => confirmOptionEdit(e, entry, div, beforeEditVal));

        const pencilIcon = createSVGIcon(["bi", "bi-pencil"],
                "M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293z"
        );
        pencilIcon.setAttribute("title", "edit");
        pencilIcon.addEventListener("click", (ev) => {
                beforeEditVal = span.innerText;
                editOption(ev);
        });

        const removeIcon = createSVGIcon(["bi", "bi-x-lg"],
                "M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
        );
        removeIcon.setAttribute("title", "delete");
        removeIcon.addEventListener("click", (e: Event) => {
                Globals.supabase.deleteFieldHelper({ fieldIds: [entry.field_id!], values: [optionText] });

                changeAffectedEntries(entry.field_id!, optionText, "");
                div.remove();
                e.stopPropagation();
        });

        div.addEventListener("click", () => dropdownOptionSelected(div, optionText, entry, HTMLElemEntry));

        div.append(span, pencilIcon, checkIcon, removeIcon);
        return div;
}

function setDropdownOptions(entry: Entry, entryHTMLElem: HTMLDivElement): HTMLDivElement {
        const div = document.querySelector(".dropdown-menu") as HTMLDivElement;
        const keep = Array.from(div.children).slice(div.children.length - 3) as Array<HTMLDivElement>;

        const newEmptyNode = keep[1].cloneNode(true) as HTMLDivElement;
        newEmptyNode.addEventListener("click", () => dropdownOptionSelected(newEmptyNode, "", entry, entryHTMLElem));

        keep[1].replaceWith(newEmptyNode);
        keep[1] = newEmptyNode;

        let createdOptions: Array<Node> = [];

        const field = Globals.fields.get(entry.field_id!)!;

        for (const fieldHelper of field.fieldHelpers ?? []) {
                createdOptions.push(createOption(entry, entryHTMLElem, fieldHelper.value));
        }

        Globals.activeDropdown.entry = entry;
        Globals.activeDropdown.elem = entryHTMLElem;
        Globals.activeDropdown.addOption = keep[0];

        div.replaceChildren(...createdOptions, ...keep);
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
        span.addEventListener("blur", async (e: Event) => buttonEntryBlur(e, entry));
        span.addEventListener("keydown", (e) => {
                if (e.key == "Enter") span.blur();
        });

        buttonEntryPress(btn, span, entry);

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

export function genColumn(field: Field): HTMLDivElement {
        const div = Object.assign(document.createElement('div'), {
                className: "column-div",
        });
        Object.assign(div.dataset, {
                boardId: field.board_id,
                type: field.type,
                fieldId: field.id
        });

        const label = Object.assign(document.createElement("label"), {
                className: "column-label",
                textContent: `id: ${field.id}`
        })
        boardElements.colHover.appendChild(label);

        const input = Object.assign(document.createElement('input'), {
                type: "text",
                value: `${field.name}`,
                className: "column"
        });
        input.addEventListener("blur", async (ev) => {
                columnInputBlur(ev, field);
        });

        const removeBtn = Object.assign(document.createElement('button'), {
                innerText: "×",
                className: "btn btn-danger remove-column",
        });
        removeBtn.addEventListener("click", async (ev: MouseEvent) => {
                deleteField(ev, field);
                div.remove();
                label.remove();
        });

        div.addEventListener("mouseover", () => {
                setStateClass([removeBtn], [], "shown")
                const rect = div.getBoundingClientRect();
                const cPadding = window.innerWidth - boardElements.columnsDiv.clientWidth;
                if (rect.left < cPadding / 2 || rect.right > window.innerWidth - (cPadding / 2)) return;

                Object.assign(label.style, {
                        width: `${rect.width}px`,
                        left: `${rect.left}px`,
                        top: `${rect.top - label.clientHeight}px`,
                        opacity: "1"
                });
        });

        div.addEventListener("mouseleave", () => {
                setStateClass([], [removeBtn], "shown")
                Object.assign(label.style, { opacity: "0" });
        });

        div.append(input, removeBtn);

        return div;
}

export function createAutomationSelectionOption(field: Field): HTMLDivElement {
        const automationDiv = Object.assign(document.createElement('div'), {
                className: "automation-field-div"
        });
        Object.assign(automationDiv.dataset, { "fieldId": field.id })

        const fieldId = Object.assign(document.createElement('span'), {
                innerText: `id: ${field.id}`,
        });
        const fieldName = Object.assign(document.createElement('b'), {
                innerText: `${field.name}`,
        });
        const fieldType = Object.assign(document.createElement('span'), {
                innerText: `${field.type}`,
        });

        automationDiv.appendChild(fieldId);
        automationDiv.appendChild(fieldName);
        automationDiv.appendChild(fieldType);

        automationDiv.addEventListener("click", () => {
                setStateClass(
                        [automationElements.urlCallDiv],
                        [automationElements.fieldSelection, automationElements.createAutomations, automationElements.createdAutomations],
                        "shown");

                Globals.selectedFieldId = field.id;
        });

        return automationDiv;
}

export function createExistingAutomation(automation: Automation) {
        const div = Object.assign(document.createElement('div'), {
                title: automation.url_call,
                className: "board-automation-option",
        });

        const id = Object.assign(document.createElement('span'), {
                innerText: `field-id: ${automation.field_id}`,
        });

        const type = Object.assign(document.createElement('span'), {
                innerText: `type: ${AutomationId[automation.automation_id]}`,
        });

        const delBtn = Object.assign(document.createElement('button'), {
                className: "btn-close",
        });

        delBtn.addEventListener("click", () => deleteAutomation(div, automation));

        div.append(id, type, delBtn);
        automationElements.createdAutomations.appendChild(div);
}

export async function fillExistingAutomations() {
        const automations = await Globals.supabase.fetchFieldAutomations(Globals.boardId);
        automationElements.createdAutomations.innerHTML = "";

        automations.forEach((automation: Automation) => createExistingAutomation(automation));
}

export async function createFields(fields: Array<Field>) {
        for (const field of fields) {
                Globals.fields.set(field.id!, field);

                const column = genColumn(field);
                const lastChild = boardElements.columnsDiv.lastElementChild;
                boardElements.columnsDiv.insertBefore(column, lastChild);
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
                className: "entry-check"
        });
        Object.assign(checkbox.dataset, {
                "boardId": `${Globals.boardId}`,
                "index": `${entries[0].index}`,
        });

        const columnsDiv = boardElements.columnsDiv;

        checkbox.addEventListener("change", () => {
                const entryBoxesSelected = document.querySelectorAll(".entry-check:checked").length;
                bottomToolbar.numEntriesDiv.innerText = `${entryBoxesSelected}`;

                if (entryBoxesSelected == boardElements.entryChecks.length) {
                        boardElements.columnCheck.checked = true;
                        return;
                }
                else if (entryBoxesSelected > 0) {
                        boardElements.columnCheck.checked = false;
                        bottomToolbar.outerDiv.classList.add("shown");
                }
                else {
                        boardElements.columnCheck.checked = false;
                        bottomToolbar.outerDiv.classList.remove("shown");
                }
        });

        checkboxDiv.appendChild(checkbox);
        entrySet.appendChild(checkboxDiv);
        const columnDivs = columnsDiv.querySelectorAll(".column-div") as NodeListOf<HTMLDivElement>;

        for (let i = 0; i < entries.length; i++) {
                entries[i].type = entries[i].type ?? columnDivs[i].dataset.type;

                const divEntry = genEntry(entries[i]);
                entrySet.appendChild(divEntry);
        }

        boardElements.entries.appendChild(entrySet);
}

/** Creates entries for a specific field */
export async function createFieldColumn(entries: Array<Entry>) {
        const entrySets = document.querySelectorAll(".entry-set") as NodeListOf<HTMLDivElement>;

        for (let i = 0; i < entrySets.length; i++) {
                const entry = genEntry(entries[i]);
                entrySets[i].appendChild(entry);
        }
}

export async function createEntries() {
        const entries = await Globals.supabase.fetchEntries(Globals.boardId) as Array<Entry>;
        const columnFields = boardElements.columnsDiv.querySelectorAll(".column-div");

        for (let i = 0; i < entries.length; i += columnFields.length) {
                createEntryRow(entries.slice(i, i + columnFields.length));
        }
}

export function findFieldHelper(fieldId: number, value: string): FieldHelper | undefined {
        const field = Globals.fields.get(fieldId);
        if (!field || !field.fieldHelpers) {
                return
        }

        for (const fieldHelper of field?.fieldHelpers!) {
                if (fieldHelper.value == value) return fieldHelper;
        }
}

export function initScrollObserver() {
        const container = boardElements.container;

        const updateFade = () => {
                const canScroll = container.scrollWidth > container.clientWidth;
                const isAtEnd = Math.abs(container.scrollLeft) + container.clientWidth >= container.scrollWidth - 10;

                if (!canScroll || isAtEnd) {
                        container.classList.add('is-at-end');
                } else {
                        container.classList.remove('is-at-end');
                }
        };

        updateFade();

        container.addEventListener('scroll', updateFade, { passive: true });
        window.addEventListener('resize', updateFade);
}

export function showToast(message: string, type: 'success' | 'error' = 'success') {
        const toast = document.createElement('div');

        const innerHTML = `
        <span>${message}</span>
        <span style="margin-right: 15px; cursor: pointer; opacity: 0.7;" onclick="this.parentElement.remove()">✕</span>`;

        Object.assign(toast, {
                className: `toast ${type}`,
                innerHTML: innerHTML,
        });

        Object.assign(toast.style, {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
        });

        if (boardElements.toastContainer) {
                boardElements.toastContainer.appendChild(toast);
        } else {
                console.error("Toast container missing in boardElements!");
        }

        setTimeout(() => {
                toast.classList.add('toast-exit');
                toast.addEventListener('animationend', () => toast.remove());
        }, 4000);
}
