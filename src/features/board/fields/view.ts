import { HTML } from "./html";
import DOMPurify from 'dompurify';
import type { Field, FieldHelper } from "./types";
import { dragProps } from "./event";
import { BoardStore } from "../board-state";
import { setStateClass } from "@/core/utils/dom";
import { PermissionId } from "@/core/types/auth";
import { entryEvents } from "../entries/custom-events";

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
        div.append(input, editBtn);

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

export function createStatusOption(helper: FieldHelper) {
        const div = Object.assign(document.createElement("div"), { className: "status-option-item" });
        div.dataset.helperId = `${helper.id}`;
        div.innerHTML = DOMPurify.sanitize(
                `<input type="text" class="field-edit-input" value="${helper.value}">
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
                for (const helper of field.fieldHelpers ?? []) {
                        HTML.editModal.status.list.appendChild(createStatusOption(helper));
                }
                HTML.editModal.status.section.classList.remove("d-none");
        }
        else if (field.type == "button") {
                const fieldHelper = field?.fieldHelpers?.at(0);
                HTML.editModal.button.section.classList.remove("d-none");

                const input = HTML.editModal.button.input
                input.value = fieldHelper?.value ?? "";
                input.dataset.dbValue = input.value;
                input.dataset.fieldId = `${field.id}`;
                input.dataset.helperId = `${fieldHelper?.id ?? ""}`;
        }
        else {
                HTML.editModal.status.list.innerHTML = "";
        }
}


export async function fieldDrag(e: MouseEvent) {
        if (!dragProps.field || !dragProps.fieldRect) return;
        if (e.x >= dragProps.fieldRect.left && e.x <= dragProps.fieldRect.right) return;

        const increase = e.x > dragProps.fieldRect.right;

        const field1 = dragProps.field;
        const field2 = (increase ? field1.nextElementSibling : field1.previousElementSibling) as HTMLDivElement;

        const fieldSwapObj = { field1, field2 };

        swapField(fieldSwapObj);

        dragProps.fieldRect = dragProps.field!.getBoundingClientRect();

        window.dispatchEvent(entryEvents.visuallySwap({ field1_id: field1.dataset.fieldId!, field2_id: field2.dataset.fieldId! }));
}

function swapField({ field1: field1, field2 }: { field1: HTMLDivElement, field2: HTMLDivElement }) {
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

        HTML.fieldCheck.disabled = permission == PermissionId.Member;

        if (permission == PermissionId.Member) {
                HTML.editModal.input.disabled = true;
                HTML.editModal.deleteBtn.disabled = true;
                HTML.editModal.button.input.disabled = true;
                HTML.editModal.status.addBtn.disabled = true;
                HTML.editModal.status.addInput.disabled = true;
        }

        if (permission >= PermissionId.Editor) {
                setStateClass([HTML.newFieldBtn], [], "shown")
        }
}
