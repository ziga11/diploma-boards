import { HTML } from "../html";
import type { Field } from "../types";
import { closeDialog } from "@/core/utils/dom";

const ruleIndexMap = new Map<string, number>();

function getOrCreateStyleSheet(): CSSStyleSheet {
        let widthsCss = document.head.querySelector<HTMLStyleElement>("#dynamic-column-widths");
        if (!widthsCss) {
                widthsCss = Object.assign(document.createElement("style"), { id: "dynamic-column-widths" });
                document.head.appendChild(widthsCss);
        }
        return widthsCss.sheet as CSSStyleSheet;
}

export function clearAllFields() {
        HTML.fieldsDiv.querySelectorAll(".field-div").forEach(div => div.remove());
}

export function updateLiveFieldWidth(fieldId: string, width: number): void {
        const sheet = getOrCreateStyleSheet();
        const ruleSelector = `[data-field-id="${fieldId}"]`;

        if (ruleIndexMap.has(fieldId)) {
                const index = ruleIndexMap.get(fieldId)!;
                const rule = sheet.cssRules[index] as CSSStyleRule;
                rule.style.setProperty("--col-width", `${width}px`);
        } else {
                const newIndex = sheet.cssRules.length;
                sheet.insertRule(`${ruleSelector} { --col-width: ${width}px; }`, newIndex);
                ruleIndexMap.set(fieldId, newIndex);
        }
}

export function applyFieldWidthStyles(widthRecords: Record<string, number>): void {
        const sheet = getOrCreateStyleSheet();

        for (const [fieldId, width] of Object.entries(widthRecords)) {
                const ruleSelector = `[data-field-id="${fieldId}"]`;
                const index = sheet.cssRules.length;
                sheet.insertRule(`${ruleSelector} { --col-width: ${width}px; }`, index);
                ruleIndexMap.set(fieldId, index);
        }
}

export function createHTMLField(field: Field): HTMLDivElement {
        const div = Object.assign(document.createElement('div'), {
                className: "field-div",
        });
        Object.assign(div.dataset, {
                type: field.type,
                fieldId: `${field.id}`,
                order: `${field.index}`
        });

        const input = Object.assign(document.createElement('span'), {
                innerText: `${field.name ?? ""}`,
                className: "field",
        });

        const fieldDropdown = Object.assign(document.createElement('button'), {
                className: "field-dropdown-btn",
                innerHTML: `<i class="ti ti-chevron-down"></i>`,
        });

        const resizerDiv = Object.assign(document.createElement("div"), { className: "resizer" });

        div.append(input, fieldDropdown, resizerDiv);
        return div;
}

export function addHTMLField(field: Field): HTMLDivElement {
        const fieldHTML = createHTMLField(field);
        const lastChild = HTML.fieldsDiv.lastElementChild;
        HTML.fieldsDiv.insertBefore(fieldHTML, lastChild);
        return fieldHTML;
}

export function setFieldDivs(fields: Array<Field>) {
        removeAllFields();

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < fields.length; i++) {
                fragment.append(createHTMLField(fields[i]));
        }
        HTML.fieldsDiv.insertBefore(fragment, HTML.newFieldBtn);
}

export function removeAllFields() {
        HTML.fieldsDiv.querySelectorAll(".field-div").forEach(el => el.remove());
}

export function removeField(fieldDiv: HTMLDivElement) {
        fieldDiv.remove();
}

export function updateHTMLField(elem: HTMLDivElement, field: Field) {
        elem.dataset.fieldId = String(field.id);
}

export function updateFieldNameUi(id: string, name: string) {
        const fieldDiv = HTML.fieldsDiv.querySelector(`.field-div[data-field-id="${id}"]`) as HTMLDivElement;
        const inp = fieldDiv.firstChild as HTMLSpanElement;
        inp.innerText = name!;

        if (!HTML.editModal.dialog.open) return;
        HTML.editModal.title.innerText = `Edit Field: ${name}`;
}

export function onFieldHover(fieldDiv?: HTMLDivElement) {
        if (!fieldDiv) return;
        onFieldHoverLeave();

        const newEditElem = fieldDiv.querySelector(".field-dropdown-btn") as HTMLButtonElement;
        const resizer = fieldDiv.querySelector(".resizer") as HTMLDivElement;

        resizer.classList.add("shown");
        newEditElem?.classList.add("shown");
}

export function onFieldHoverLeave() {
        const dropdownIcon = HTML.fieldsDiv.querySelector(".field-dropdown-btn.shown") as HTMLButtonElement | null;
        const resizer = HTML.fieldsDiv.querySelector(".resizer.shown") as HTMLDivElement | null;

        dropdownIcon?.classList.remove("shown");
        resizer?.classList.remove("shown");
}

export function showNewFieldMenu(left: number, top: number) {
        const addMenu = HTML.newFieldMenu;
        addMenu.showModal();
        addMenu.style.left = `${left}px`;
        addMenu.style.top = `${top}px`;
}

export function closeNewFieldMenu() {
        closeDialog(HTML.newFieldMenu);
}

export function showEditFieldMenu(left: number, top: number, ascending: boolean, descending: boolean) {
        HTML.fieldDropdown.div.style.left = `${left}px`;
        HTML.fieldDropdown.div.style.top = `${top}px`;
        HTML.fieldDropdown.descending.classList.toggle("active", descending);
        HTML.fieldDropdown.ascending.classList.toggle("active", ascending);
        HTML.fieldDropdown.div.showModal();
}

export function closeFieldMenu() {
        closeDialog(HTML.fieldDropdown.div);
}

export function applyPermissionRestrictions(isMember: boolean) {
        HTML.fieldDropdown.edit.style.display = isMember ? "none" : "flex";
        HTML.fieldCheck.disabled = isMember;
        HTML.newFieldBtn.classList.toggle("shown", !isMember);
}
