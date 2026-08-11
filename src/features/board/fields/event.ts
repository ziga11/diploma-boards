import { showToast } from "@/core/utils/dom";
import { HTML } from "./html";
import { entryEvents, } from "@/features/board/entries/custom-events";
import { fieldEvents } from "./custom-events";
import { FieldsState } from "./state";
import { addStatusOption, showEditFieldModal } from "./ui/option";
import { addHTMLField, applyPermissionRestrictions, clearAllFields, onFieldHover, onFieldHoverLeave, } from "./ui/field";
import { fieldDrag, onFieldDragStart, onFieldResizeEnd, onFieldResizeStart, onFieldSwapEnd, onSortingOptionPress, resizeField, showEditFieldDropdown, showNewFieldDropdown, swapField } from "./logic/interactions";
import { handleAddFieldOption, handleButtonOptionChange, handleCreateField, handleDeleteField, handleFieldNameChange, handleRemoveFieldOption, handleStatusOptionChange, updateFieldName, updateFieldOption } from "./logic/operations";

export function initFieldEvents() {
        HTML.newFieldBtn.addEventListener("click", () => showNewFieldDropdown());

        HTML.newFieldMenu.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                const fieldType = elem.dataset.fieldType;
                if (!fieldType) return;

                handleCreateField(fieldType);
        });

        HTML.editModal.dialog.addEventListener("click", (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                const fieldId = HTML.editModal.idSpan.innerText.trim();

                if (!fieldId) return;

                if (target === HTML.editModal.deleteBtn || target.closest("#delete-field-btn")) {
                        handleDeleteField(fieldId);
                }
                else if (target === HTML.editModal.status.addBtn) {
                        const value = HTML.editModal.status.addInput.value.trim();
                        handleAddFieldOption(fieldId, value);
                }
                else if (target.className == "remove-status-option") {
                        const div = target.closest(".status-option-item") as HTMLDivElement;
                        const id = String(div.dataset.optionId);
                        handleRemoveFieldOption(id, fieldId);
                }

        });

        HTML.editModal.idDiv.addEventListener("click", () => {
                const fieldId = HTML.editModal.idSpan.innerText;

                showToast("ID copied to clipboard", "success");
                navigator.clipboard.writeText(fieldId);
        })

        HTML.editModal.button.input.addEventListener("keydown", (e: KeyboardEvent) => {
                const input = e.target as HTMLInputElement;
                if (e.key == "Enter") input.blur();
        });

        HTML.editModal.dialog.addEventListener("focusout", async (e: FocusEvent) => {
                const elem = e.target as HTMLInputElement;

                if (elem === HTML.editModal.button.input) {
                        handleButtonOptionChange();
                }
                else if (elem === HTML.editModal.input) {
                        handleFieldNameChange();
                }
                else if (elem.className == "field-edit-input" && elem != HTML.editModal.status.addInput) {
                        const newValue = elem.value;
                        const statusDiv = elem.closest(".status-option-item") as HTMLDivElement;

                        handleStatusOptionChange(statusDiv, newValue);
                }
        });

        HTML.editModal.dialog.addEventListener("close", () => {
                HTML.editModal.button.section.classList.add("d-none");
                HTML.editModal.status.section.classList.add("d-none");
        });

        HTML.fieldsDiv.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] == "field-dropdown-btn") {
                        const fieldDiv = elem.parentElement as HTMLDivElement;
                        showEditFieldDropdown(fieldDiv);
                }
                else if (elem.className == HTML.fieldCheck.className) {
                        window.dispatchEvent(entryEvents.entryCheckChangeAll(HTML.fieldCheck.checked));
                }
        });

        HTML.fieldDropdown.div.addEventListener("click", async (e: Event) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] != "field-dropdown-option") return;

                const fieldId = HTML.fieldDropdown.div.dataset.fieldId;
                if (!fieldId) return;

                if (elem.id === "edit-field") {
                        showEditFieldModal(fieldId);
                }
                else {
                        const ascending = elem === HTML.fieldDropdown.ascending;

                        onSortingOptionPress(fieldId, ascending)
                }
        });

        HTML.fieldsDiv.addEventListener("mouseover", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                const fieldDiv = elem.closest(".field-div") as HTMLDivElement;
                onFieldHover(fieldDiv);
        });

        HTML.fieldsDiv.addEventListener("mouseleave", onFieldHoverLeave);

        window.addEventListener(fieldEvents.setFieldVisibility.type, (e: Event) => {
                const { fieldId, visible } = (e as ReturnType<typeof fieldEvents.setFieldVisibility>).detail;

                const field1 = HTML.fieldsDiv.querySelector(`.field-div[data-field-id="${fieldId}"]`) as HTMLDivElement;
                field1.style.display = visible ? "block" : "none";
        });

        window.addEventListener(fieldEvents.removeField.type, (e: Event) => {
                const fieldId = (e as ReturnType<typeof fieldEvents.removeField>).detail;

                const field1 = HTML.fieldsDiv.querySelector(`.field-div[data-field-id="${fieldId}"]`) as HTMLDivElement;
                field1.remove();

                FieldsState.removeField(fieldId);
        });

        window.addEventListener(fieldEvents.realtimeSwapField.type, (e: Event) => {
                const { field1_id, field2_id } = (e as ReturnType<typeof fieldEvents.realtimeSwapField>).detail;

                const field1 = HTML.fieldsDiv.querySelector(`.field-div[data-field-id="${field1_id}"]`) as HTMLDivElement;
                const field2 = HTML.fieldsDiv.querySelector(`.field-div[data-field-id="${field2_id}"]`) as HTMLDivElement;

                swapField({ field1, field2 });
        });

        window.addEventListener(fieldEvents.checkChange.type, (e: Event) => {
                const checked = (e as ReturnType<typeof fieldEvents.checkChange>).detail;

                HTML.fieldCheck.checked = checked;
        });

        window.addEventListener(fieldEvents.fieldNameUpdate.type, (e: Event) => {
                const { id, name } = (e as ReturnType<typeof fieldEvents.fieldNameUpdate>).detail;

                updateFieldName(id, name);
        });

        window.addEventListener(fieldEvents.addField.type, (e: Event) => {
                const field = (e as ReturnType<typeof fieldEvents.addField>).detail;

                FieldsState.addField(field);

                addHTMLField(field);
        });

        window.addEventListener(fieldEvents.addFieldOption.type, (e: Event) => {
                const { id, fieldId, value, accountId } = (e as ReturnType<typeof fieldEvents.addFieldOption>).detail;

                const field = FieldsState.getFieldById(fieldId);
                if (!field) return;

                FieldsState.addOption({ id, field_id: fieldId, value, account_id: accountId })
                addStatusOption(id, fieldId, value);
        });

        window.addEventListener(fieldEvents.updateFieldOption.type, (e: Event) => {
                const { id, fieldId, oldValue, value, accountId } = (e as ReturnType<typeof fieldEvents.updateFieldOption>).detail;

                updateFieldOption(id, fieldId, value, oldValue, accountId);
        });

        window.addEventListener(fieldEvents.applyPermissionRestrictions.type, (e: Event) => {
                const { isMember } = (e as ReturnType<typeof fieldEvents.applyPermissionRestrictions>).detail;

                applyPermissionRestrictions(isMember);
        });

        window.addEventListener(fieldEvents.clearFields.type, () => clearAllFields());

        window.addEventListener(fieldEvents.removeFieldOption.type, (e: Event) => {
                const { fieldId, id } = (e as ReturnType<typeof fieldEvents.removeFieldOption>).detail;
                FieldsState.removeOption(fieldId, id);
        });

        document.addEventListener("mousedown", (e: MouseEvent) => {
                const elem = e.target as HTMLDivElement;

                if (elem.classList[0] == "field-div") {
                        onFieldDragStart(elem);
                }
                else if (elem.classList[0] == "resizer") {
                        const parentField = elem.closest(".field-div") as HTMLDivElement;

                        if (!parentField) return;

                        onFieldResizeStart(parentField)
                }
        });

        document.addEventListener("mouseup", () => {
                document.removeEventListener("mousemove", resizeField);
                document.removeEventListener("mousemove", fieldDrag);

                onFieldSwapEnd();
                onFieldResizeEnd();
        });
}
