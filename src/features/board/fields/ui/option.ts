import DOMPurify from 'dompurify';
import { FieldsState } from '../state';
import type { Field, FieldOption } from '../types';
import { closeFieldMenu } from './field';
import { HTML } from '../html';

export function showEditFieldModal(fieldId: string) {
        const field = FieldsState.getFieldById(fieldId!) as Field;
        populateFieldEditModal(field);

        closeFieldMenu();
        HTML.editModal.dialog.showModal();
}

export function populateFieldEditModal(field: Field): void {
        HTML.editModal.input.value = field.name ?? "";
        HTML.editModal.input.dataset.dbValue = field.name ?? "";
        HTML.editModal.idSpan.textContent = `${field.id}`;
        HTML.editModal.title.innerText = `Edit Field: ${field.name}`;

        if (field.type === "status") {
                populateStatusEditField(field.options ?? {});
        } else if (field.type == "button") {
                const option = Object.values(field.options!)[0];
                populateButtonEditField(field.id!, option.id!, option.value);
        } else {
                HTML.editModal.status.list.innerHTML = "";
        }
}

function populateStatusEditField(options: Record<string, FieldOption>) {
        HTML.editModal.status.list.innerHTML = "";
        for (const option of Object.values(options ?? {})) {
                HTML.editModal.status.list.appendChild(createStatusOption(option.id!, option.value));
        }
        HTML.editModal.status.section.classList.remove("d-none");
}

function populateButtonEditField(fieldId: string, optionId: string, value: string) {
        HTML.editModal.button.section.classList.remove("d-none");

        const input = HTML.editModal.button.input;
        input.value = value;
        input.dataset.dbValue = value;
        input.dataset.fieldId = fieldId;
        input.dataset.optionId = optionId;
}

// --- Option Mutation & Inputs ---
export function updateEditFieldOption(optionId: string, value: string) {
        const targetElem = HTML.editModal.dialog.querySelector(`[data-option-id="${optionId}"]`);

        const inputElem = targetElem instanceof HTMLDivElement
                ? targetElem.querySelector("input")
                : targetElem as HTMLInputElement;

        if (inputElem) {
                inputElem.value = value;
        }
}

export function setEditFieldOptionVisibility(id: string, visible: boolean) {
        const modalOption = HTML.editModal.dialog.querySelector(`[data-option-id="${id}"]`) as HTMLDivElement;
        modalOption.style.display = visible ? "flex" : "none";
}

export function removeFieldOption(fieldId: string) {
        if (!HTML.editModal.dialog.open || HTML.editModal.idSpan.innerText != fieldId) {
                return;
        }
        HTML.editModal.status.addInput.value = "";
}

export function createStatusOption(id: string, value: string) {
        const div = Object.assign(document.createElement("div"), { className: "status-option-item" });
        div.dataset.optionId = id;
        div.dataset.dbValue = value;

        div.innerHTML = DOMPurify.sanitize(
                `<input type="text" class="field-edit-input" value="${value}">
        <button class="btn btn-sm btn-outline-danger remove-status-option">×</button>`
        );

        return div;
}

export function addStatusOption(id: string, fieldId: string, value: string) {
        if (!HTML.editModal.dialog.open || HTML.editModal.idSpan.innerText != fieldId)
                return;

        const statusOptionDiv = createStatusOption(id, value);

        HTML.editModal.status.list.appendChild(statusOptionDiv);
        HTML.editModal.status.addInput.value = "";
}
