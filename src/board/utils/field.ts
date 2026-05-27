import { Globals } from "../../globals";
import type { Field, FieldHelper } from "../../types";
import { setStateClass } from "../../utils";
import { buttonTextBlur } from "../events/entry/utils";
import { deleteField, endFieldDrag, startFieldDrag } from "../events/field/utils";
import { boardElements, editFieldModal } from "../types";

export function genField(field: Field): HTMLDivElement {
        const div = Object.assign(document.createElement('div'), {
                className: "field-div",
        });
        Object.assign(div.dataset, {
                boardId: field.board_id,
                type: field.type,
                fieldId: field.id
        });

        const input = Object.assign(document.createElement('span'), {
                innerText: `${field.name}`,
                className: "field",
        });

        const editBtn = Object.assign(document.createElement('button'), {
                innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil-cog">
	<path stroke="none" d="M0 0h24v24H0z" fill="none" />
	<path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
	<path d="M13.5 6.5l4 4" />
	<path d="M17.001 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
	<path d="M19.001 15.5v1.5" />
	<path d="M19.001 21v1.5" />
	<path d="M22.032 17.25l-1.299 .75" />
	<path d="M17.27 20l-1.3 .75" />
	<path d="M15.97 17.25l1.3 .75" />
	<path d="M20.733 20l1.3 .75" />
</svg>`,
                className: "edit-field",
        });
        Object.assign(editBtn.dataset, {
                bsToggle: "modal",
                bsTarget: "#field-edit-modal",
        });

        editBtn.addEventListener("click", () => {
                populateFieldEditModal(field);
        });

        div.addEventListener("mouseover", () => {
                setStateClass([editBtn], [], "shown");
        });

        div.addEventListener("mouseleave", () => {
                setStateClass([], [editBtn], "shown");
        });

        div.addEventListener("mousedown", startFieldDrag);

        div.addEventListener("mouseup", endFieldDrag);

        div.append(input, editBtn);

        return div;
}

export function btnBlur(event: Event) {
        const input = event.target as HTMLInputElement;
        const fieldId = Number(editFieldModal.fieldIdSpan.textContent);
        buttonTextBlur(fieldId, input.value);
}

export function btnEnterPress(event: KeyboardEvent) {
        const input = event.target as HTMLInputElement;
        if (event.key == "Enter") input.blur();
}

export function addStatusOptionEvent() {
        const fieldId = Number(editFieldModal.fieldIdSpan.textContent);
        const val = editFieldModal.status.addInput.value.trim();
        if (val.length == 0) return;

        Globals.supabase.insertFieldHelper(fieldId, val).then(fieldHelper => {
                editFieldModal.status.list.appendChild(addStatusOption(fieldHelper));
                editFieldModal.status.addInput.value = "";
                const currField = Globals.fields.get(fieldId);
                if (!currField?.fieldHelpers) {
                        currField!.fieldHelpers = [];
                }
                currField!.fieldHelpers!.push(fieldHelper!);
        });
}

function addStatusOption(helper: FieldHelper) {
        const fieldId = Number(editFieldModal.fieldIdSpan.textContent);
        const div = document.createElement("div");
        div.innerHTML = `<div class="status-option-item" data-helper-id="${helper.id}">
                        <input type="text" class="field-edit-input" value="${helper.value}">
                        <button class="btn btn-sm btn-outline-danger remove-status-option" data-helper-id="${helper.id}">×</button>
                </div>`;

        const removeOption = div.querySelector(".remove-status-option") as HTMLButtonElement;
        removeOption.addEventListener("click", () => {
                Globals.supabase.deleteFieldHelper({
                        fieldIds: [fieldId],
                        values: [helper.value],
                });
                div.remove();
        });

        const input = div.querySelector(".field-edit-input") as HTMLInputElement;
        input.addEventListener("blur", () => {
                Globals.supabase.updateFieldHelper(input.value, { id: helper.id })
        });

        return div
}

export function updateFieldNameEvent() {
        const fieldId = Number(editFieldModal.fieldIdSpan.textContent);
        Globals.supabase.updateField(fieldId, editFieldModal.fieldInput.value);

        const fieldDiv = boardElements.fieldsDiv.querySelector(`.field-div[data-field-id="${fieldId}"]`) as HTMLDivElement;
        const inp = fieldDiv.firstChild as HTMLSpanElement;
        inp.textContent = editFieldModal.fieldInput.value;
}

export function deleteFieldEvent() {
        const fieldId = Number(editFieldModal.fieldIdSpan.textContent);
        const fieldDiv = boardElements.fieldsDiv.querySelector(`.field-div[data-field-id="${fieldId}"]`) as HTMLDivElement;

        deleteField(fieldId);
        fieldDiv.remove();
        const modalInstance = (window as any).bootstrap.Modal.getOrCreateInstance(editFieldModal.modal);
        modalInstance.hide();
}

function populateFieldEditModal(field: Field): void {
        editFieldModal.fieldInput.value = field.name ?? "";
        editFieldModal.fieldIdSpan.textContent = String(field.id);

        if (field.type === "status") {
                for (const helper of field.fieldHelpers ?? []) {
                        editFieldModal.status.list.appendChild(addStatusOption(helper));
                }
                editFieldModal.status.section.classList.remove("d-none");
        }
        else if (field.type == "button") {
                const fieldHelper = field?.fieldHelpers?.at(0);

                const input = editFieldModal.button.textInput
                input.value = fieldHelper?.value!;
                input.dataset.fieldId = `${field.id}`;

                input.addEventListener("keydown", btnEnterPress);
                input.addEventListener("blur", btnBlur);

                editFieldModal.button.section.classList.remove("d-none");
        }
        else {
                editFieldModal.status.list.innerHTML = "";
        }

        editFieldModal.status.addBtn.addEventListener("click", addStatusOptionEvent);
        editFieldModal.saveFieldName.addEventListener("click", updateFieldNameEvent)
        editFieldModal.deleteField.addEventListener("click", deleteFieldEvent);
}

export function createFields(fields: Array<Field>) {
        const startInd = boardElements.fields.length + 1;
        for (let i = 0; i < fields.length; i++) {
                const f = fields[i];

                Globals.fields.set(f.id!, f);

                const field = genField(f);
                field.dataset.order = `${startInd + i}`;
                const lastChild = boardElements.fieldsDiv.lastElementChild;
                boardElements.fieldsDiv.insertBefore(field, lastChild);
        }
}
