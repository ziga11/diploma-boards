import { HTML } from "./html";
import DOMPurify from 'dompurify';
import type { Field, FieldOption } from "./types";
import { resizeFieldProps, swapFieldProps } from "./event";
import { BoardStore } from "../board-state";
import { setStateClass } from "@/core/utils/dom";
import { PermissionId } from "@/core/types/auth";
import { entryEvents } from "../entries/custom-events";

const ruleIndexMap = new Map<string, number>();

export function removeAllFields() {
        HTML.fieldsDiv.querySelectorAll(".field-div").forEach(el => el.remove());
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

        const editBtn = Object.assign(document.createElement('button'), {
                className: "edit-field",
                innerHTML: `<i class="ti ti-chevron-down"></i>`,
        });

        const resizerDiv = Object.assign(document.createElement("div"), { className: "resizer" })

        div.append(input, editBtn, resizerDiv);

        return div;
}

export function addHTMLField(field: Field): HTMLDivElement {
        const fieldHTML = createHTMLField(field);

        const lastChild = HTML.fieldsDiv.lastElementChild;
        HTML.fieldsDiv.insertBefore(fieldHTML, lastChild);

        return fieldHTML;
}

export function updateHTMLField(elem: HTMLDivElement, field: Field) {
        elem.dataset.fieldId = String(field.id);
}

export function toggleNewFieldMenu() {
        const addMenu = HTML.newFieldMenu;

        addMenu.showModal();

        const addFieldBtn = HTML.newFieldBtn;
        const btnRect = addFieldBtn.getBoundingClientRect();

        let horizPos: number;
        if (btnRect.right < 1800) {
                horizPos = btnRect.right + 10;
        }
        else {
                const fieldMenuWidth = addMenu.offsetWidth;
                horizPos = btnRect.left - fieldMenuWidth - 10;
        }


        addMenu.style.left = horizPos + 'px';
        addMenu.style.top = btnRect.top + 10 + window.scrollY + 'px';
}

export function createStatusOption(option: FieldOption) {
        const div = Object.assign(document.createElement("div"), { className: "status-option-item" });
        div.dataset.optionId = `${option.id}`;
        div.dataset.dbValue = `${option.value}`;

        div.innerHTML = DOMPurify.sanitize(
                `<input type="text" class="field-edit-input" value="${option.value}">
                <button class="btn btn-sm btn-outline-danger remove-status-option">×</button>`);

        return div
}

export function populateFieldEditModal(field: Field): void {
        HTML.editModal.input.value = field.name ?? "";
        HTML.editModal.input.dataset.dbValue = field.name ?? "";
        HTML.editModal.idSpan.textContent = `${field.id}`;
        HTML.editModal.title.innerText = `Edit Field: ${field.name}`;

        if (field.type === "status") {
                HTML.editModal.status.list.innerHTML = "";
                for (const option of field.options ?? []) {
                        HTML.editModal.status.list.appendChild(createStatusOption(option));
                }
                HTML.editModal.status.section.classList.remove("d-none");
        }
        else if (field.type == "button") {
                const option = field?.options?.at(0);
                HTML.editModal.button.section.classList.remove("d-none");

                const input = HTML.editModal.button.input
                input.value = option?.value ?? "";
                input.dataset.dbValue = input.value;
                input.dataset.fieldId = `${field.id}`;
                input.dataset.optionId = `${option?.id ?? ""}`;
        }
        else {
                HTML.editModal.status.list.innerHTML = "";
        }
}


export async function fieldDrag(e: MouseEvent) {
        if (!swapFieldProps.field1 || !swapFieldProps.field1Rect) return;
        if (e.x >= swapFieldProps.field1Rect.left - swapFieldProps.leeway && e.x <= swapFieldProps.field1Rect.right + swapFieldProps.leeway) return;

        const increase = e.x > swapFieldProps.field1Rect.right;

        const field1 = swapFieldProps.field1;
        const field2 = (increase ? field1.nextElementSibling : field1.previousElementSibling) as HTMLDivElement;

        const fieldSwapObj = { field1, field2 };

        swapField(fieldSwapObj);

        const f1Rect = swapFieldProps.field1!.getBoundingClientRect();

        swapFieldProps.field1Rect = f1Rect

        if (swapFieldProps.field2 != field2) {
                const f2Rect = field2.getBoundingClientRect();
                if (f2Rect.width > f1Rect.width) {
                        swapFieldProps.leeway = f2Rect.width - swapFieldProps.field1Rect.width;
                }
        }

        swapFieldProps.field2 = field2;

        window.dispatchEvent(entryEvents.visuallySwap({ field1_id: field1.dataset.fieldId!, field2_id: field2.dataset.fieldId! }));
}

export function swapField({ field1, field2 }: { field1: HTMLDivElement, field2: HTMLDivElement }) {
        const [o1, o2] = [Number(field1.dataset.order), Number(field2.dataset.order)];

        if (o1 < o2) {
                field1.before(field2)
        }
        else {
                field1.after(field2)
        }

        field1.dataset.order = `${o2}`;
        field2.dataset.order = `${o1}`;
}

export async function resizeField(e: MouseEvent) {
        if (!resizeFieldProps.field || !resizeFieldProps.startRect) return;

        const startWidth = resizeFieldProps.startRect.width;
        const deltaX = e.clientX - resizeFieldProps.startRect.right;
        const newWidth = Math.max(50, startWidth + deltaX);
        resizeFieldProps.newWidth = newWidth;

        const fieldId = resizeFieldProps.field.dataset.fieldId;
        if (fieldId) {
                updateLiveFieldWidth(fieldId, newWidth);
        }
}

export function appendFieldDivs(fields: Array<Field>) {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < fields.length; i++) {
                const field = fields[i];

                const f = createHTMLField(field);

                fragment.append(f);
        }

        HTML.fieldsDiv.insertBefore(fragment, HTML.newFieldBtn);
}

export function applyPermissionRestrictions() {
        const permission = BoardStore.permissionId;
        if (!permission) throw new Error(`Permission not set`);

        const isMember = permission == PermissionId.Member;

        HTML.fieldCheck.disabled = isMember;
        HTML.editModal.input.disabled = isMember;
        HTML.editModal.deleteBtn.disabled = isMember;
        HTML.editModal.button.input.disabled = isMember;
        HTML.editModal.status.addBtn.disabled = isMember;
        HTML.editModal.status.addInput.disabled = isMember;

        if (permission >= PermissionId.Editor) {
                setStateClass([HTML.newFieldBtn], [], "shown")
        }
}

function updateLiveFieldWidth(fieldId: string, width: number) {
        let widthsCss = document.head.querySelector("#dynamic-column-widths") as HTMLStyleElement;
        if (!widthsCss) {
                widthsCss = Object.assign(document.createElement("style"), { id: "dynamic-column-widths" });
                document.head.appendChild(widthsCss);
        }

        const sheet = widthsCss.sheet as CSSStyleSheet;
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

export function addDynamicFieldWidthToStorage(fieldId: string, width: number) {
        const boardId = BoardStore.boardId;

        let widths = localStorage.getItem(`board_${boardId}_column_widths`);
        const widthRecords = (!widths ? {} : JSON.parse(widths)) as Record<string, number>;

        widthRecords[fieldId] = width;

        const jsonRecord = JSON.stringify(widthRecords);
        localStorage.setItem(`board_${boardId}_column_widths`, jsonRecord);
}

export function initFieldWidthStyles() {
        const boardId = BoardStore.boardId;
        const widths = localStorage.getItem(`board_${boardId}_column_widths`);
        if (!widths) return;

        const widthsCss = Object.assign(document.createElement("style"), { id: "dynamic-column-widths" });
        document.head.appendChild(widthsCss);

        const widthRecords = JSON.parse(widths) as Record<string, number>;

        const sheet = widthsCss.sheet as CSSStyleSheet;

        for (const [fieldId, width] of Object.entries(widthRecords)) {
                const ruleSelector = `[data-field-id="${fieldId}"]`;

                const index = sheet.cssRules.length;
                sheet.insertRule(`${ruleSelector} { --col-width: ${width}px; }`, index);
                ruleIndexMap.set(fieldId, index);
        }
}
