import { closeDialog, setStateClass, showToast } from "@/core/utils/dom";
import { BoardState } from "../board-state";
import { HTML } from "./html";
import { deleteField, insertFieldAndEntries, insertFieldOption, removeFieldOption, switchIndex, updateFieldName, updateFieldOption } from "./logic";
import { addDynamicFieldWidthToStorage, addHTMLField, applyPermissionRestrictions, createStatusOption, fieldDrag, populateFieldEditModal, resizeField, swapField, toggleNewFieldMenu } from "./view";
import type { Field, FieldOption } from "./types";
import { entryEvents, } from "../entries/custom-events";
import { fieldEvents } from "./custom-events";
import { PermissionId } from "@/core/types/auth";

interface DragInterface {
        field1?: HTMLDivElement,
        field2?: HTMLDivElement,
        field1Rect?: DOMRect,
        leeway: number,
        isDragging: boolean
}

interface ResizeInterface {
        field?: HTMLDivElement,
        startRect?: DOMRect,
        newWidth?: number,
        isResizing: boolean,
}

export let swapFieldProps = {} as DragInterface
export let resizeFieldProps = {} as ResizeInterface

export function initFieldEvents() {
        if (BoardState.isInitialized) return;

        HTML.newFieldBtn.addEventListener("click", (e: MouseEvent) => {
                e.stopPropagation();
                toggleNewFieldMenu();
        });

        HTML.newFieldMenu.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                const fieldType = elem.dataset.fieldType;
                if (!fieldType) return;

                const field = { id: crypto.randomUUID(), type: fieldType, index: 10000 } as Field

                const entryIds = Array.from({ length: BoardState.rowCount.all }, () => crypto.randomUUID());

                window.dispatchEvent(entryEvents.newFieldEntries({ field, entryIds }));

                const fieldElem = addHTMLField(field);

                closeDialog(HTML.newFieldMenu);

                insertFieldAndEntries(fieldType!, field.id!, entryIds)
                        .then(data => {
                                const newField = data.field;
                                newField.options = newField.options ?? {};

                                BoardState.fields.set(newField.id!, newField);

                                fieldElem.dataset.order = `${data.field.index}`;

                                field.index = data.field.index;
                                window.dispatchEvent(entryEvents.setFieldEntriesIndices({ fieldId: field.id!, index: field.index! }));
                        })
                        .catch(err => {
                                fieldElem.remove();

                                showToast(`Failed to add new field: ${err.message}`, "error");
                        });
        });

        HTML.editModal.dialog.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                const fieldId = HTML.editModal.idSpan.innerText;

                if (elem == HTML.editModal.deleteBtn) {
                        window.dispatchEvent(entryEvents.setEntryVisibility({ fieldId, visible: false }));
                        window.dispatchEvent(fieldEvents.setFieldVisibility({ fieldId, visible: false }));

                        deleteField(fieldId)
                                .then(_ => {
                                        window.dispatchEvent(entryEvents.realtimeRemoveEntries({ fieldId: fieldId }));
                                        window.dispatchEvent(fieldEvents.removeField(fieldId));
                                })
                                .catch(err => {
                                        window.dispatchEvent(fieldEvents.setFieldVisibility({ fieldId, visible: true }));
                                        window.dispatchEvent(entryEvents.showFieldEntries(fieldId));

                                        showToast(`Failed to remove field ${err}`, "error");
                                });
                }
                else if (elem == HTML.editModal.status.addBtn) {
                        const value = HTML.editModal.status.addInput.value.trim();
                        if (!fieldId) {
                                showToast("field id not set", "error");
                                return;
                        }
                        if (!value) {
                                showToast("value of the option cannot be empty", "error");
                                return;
                        }

                        const id = crypto.randomUUID();
                        window.dispatchEvent(fieldEvents.addFieldOption({ id, fieldId, value }));

                        insertFieldOption(id, fieldId, value)
                                .catch(err => {
                                        window.dispatchEvent(fieldEvents.removeFieldOption({ id, fieldId, inputValue: value }));
                                        showToast(`Failed to add the field option: ${err}`, "error");
                                });
                }
                else if (elem.className == "remove-status-option") {
                        const div = elem.closest(".status-option-item") as HTMLDivElement;
                        const id = div.dataset.optionId;
                        if (!id) return;

                        window.dispatchEvent(fieldEvents.setFieldOptionVisibility({ id, fieldId, visible: false }));

                        removeFieldOption(id)
                                .then(_ => {
                                        window.dispatchEvent(fieldEvents.removeFieldOption({ id, fieldId }));
                                })
                                .catch(err => {
                                        window.dispatchEvent(fieldEvents.setFieldOptionVisibility({ id, fieldId, visible: true }));

                                        showToast(`Failed to remove the status option: ${err}`, "error");
                                });
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
                const fieldId = HTML.editModal.idSpan.innerText;

                if (elem === HTML.editModal.button.input) {
                        const input = HTML.editModal.button.input;
                        const dbValue = input.dataset.dbValue!;
                        const value = input.value;

                        if (dbValue == value) return;

                        const id = input.dataset.optionId;
                        if (!id) return;

                        window.dispatchEvent(fieldEvents.updateFieldOption({ id, fieldId, value }));

                        try {
                                await updateFieldOption(id, value);
                        }
                        catch (err) {
                                window.dispatchEvent(fieldEvents.updateFieldOption({ id: id, fieldId, value: dbValue }));

                                console.error(err);

                                showToast("Failed to update field option text", "error");
                        }
                }
                else if (elem === HTML.editModal.input) {
                        const newName = HTML.editModal.input.value;
                        if (HTML.editModal.input.dataset.dbValue == newName || !fieldId) return;

                        window.dispatchEvent(fieldEvents.fieldNameUpdate({ id: fieldId, name: newName }));

                        updateFieldName(fieldId, newName)
                                .then(_ => HTML.editModal.input.dataset.dbValue = newName)
                                .catch(err => {
                                        const oldName = HTML.editModal.input.dataset.dbValue!;
                                        window.dispatchEvent(fieldEvents.fieldNameUpdate({ id: fieldId, name: oldName }));

                                        showToast(`Failed to change the field name: ${err}`, "error");
                                });
                }
                else if (elem.className == "field-edit-input" && elem != HTML.editModal.status.addInput) {
                        const newValue = elem.value;
                        const statusDiv = elem.closest(".status-option-item") as HTMLDivElement;
                        const oldValue = statusDiv.dataset.dbValue;
                        const id = statusDiv.dataset.optionId;

                        if (newValue == oldValue || !id) return;

                        window.dispatchEvent(fieldEvents.updateFieldOption({ id, oldValue: oldValue, value: newValue, fieldId }));

                        try {
                                updateFieldOption(id, newValue);
                        }
                        catch (err) {
                                console.error(err);

                                showToast("Failed to update field option text", "error");
                                window.dispatchEvent(fieldEvents.updateFieldOption({ id, oldValue: newValue, value: oldValue!, fieldId }));
                        }
                }
        });

        HTML.editModal.dialog.addEventListener("close", () => {
                HTML.editModal.button.section.classList.add("d-none");
                HTML.editModal.status.section.classList.add("d-none");
        });

        HTML.fieldsDiv.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] == "edit-field") {
                        const fieldDiv = elem.parentElement as HTMLDivElement;
                        const fieldId = fieldDiv.dataset.fieldId;
                        if (!fieldId) return;


                        const fieldRect = fieldDiv.getBoundingClientRect();

                        HTML.fieldDropdown.style.left = `${fieldRect.left}px`;
                        HTML.fieldDropdown.style.top = `${fieldRect.bottom + 2}px`;

                        HTML.fieldDropdown.dataset.fieldId = fieldId;

                        const ascending = HTML.fieldDropdown.querySelector("#sort-ascending-btn");
                        const descending = HTML.fieldDropdown.querySelector("#sort-descending-btn");

                        ascending?.classList.remove("active");
                        descending?.classList.remove("active");

                        if (BoardState.sortedBy.fieldId == fieldId) {
                                const option = BoardState.sortedBy.ascending ? ascending : descending;

                                option?.classList.add("active");
                        }

                        HTML.fieldDropdown.showModal();
                }
                else if (elem.className == HTML.fieldCheck.className) {
                        window.dispatchEvent(entryEvents.entryCheckChangeAll(HTML.fieldCheck.checked));
                }
        });

        HTML.fieldDropdown.addEventListener("click", async (e: Event) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] != "field-dropdown-option") return;

                const fieldId = HTML.fieldDropdown.dataset.fieldId;
                if (!fieldId) return;

                if (elem.id === "edit-field") {
                        const field = BoardState.getField(fieldId!) as Field;
                        populateFieldEditModal(field);

                        closeDialog(HTML.fieldDropdown);
                        HTML.editModal.dialog.showModal();
                }
                else {
                        const ascending = elem.id === "sort-ascending-btn";

                        const boardId = BoardState.boardId!;

                        const currSort = BoardState.sortedBy;
                        if (currSort?.fieldId == fieldId && currSort.ascending == ascending) {
                                BoardState.setSortedBy(undefined, undefined);
                                localStorage.removeItem(`${boardId}-sort-field-id`);
                                localStorage.setItem(`${boardId}-sort-ascending`, "t");
                        }
                        else {
                                BoardState.setSortedBy(fieldId, ascending);

                                if (fieldId) {
                                        localStorage.setItem(`${boardId}-sort-field-id`, fieldId);
                                }

                                if (!currSort.ascending) {
                                        localStorage.setItem(`${boardId}-sort-ascending`, "f");
                                }
                        }

                        window.dispatchEvent(entryEvents.sortChange());
                        closeDialog(HTML.fieldDropdown);
                }
        });

        HTML.fieldsDiv.addEventListener("mouseover", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                const fieldDiv = elem.closest(".field-div");
                const currEditElem = HTML.fieldsDiv.querySelector(".edit-field.shown") as HTMLButtonElement | undefined;;

                if (!fieldDiv) {
                        setStateClass([], currEditElem ? [currEditElem] : [], "shown");
                        return;
                }

                const newEditElem = fieldDiv.querySelector(".edit-field") as HTMLButtonElement;

                if (newEditElem === currEditElem) return;

                setStateClass([newEditElem], currEditElem ? [currEditElem] : [], "shown");
        });

        HTML.fieldsDiv.addEventListener("mouseleave", () => {
                const currEditElem = HTML.fieldsDiv.querySelector(".edit-field.shown") as HTMLButtonElement;

                setStateClass([], currEditElem ? [currEditElem] : [], "shown");
        });

        window.addEventListener(fieldEvents.setFieldVisibility.type, (e: Event) => {
                const { fieldId, visible } = (e as ReturnType<typeof fieldEvents.setFieldVisibility>).detail;

                const field1 = HTML.fieldsDiv.querySelector(`.field-div[data-field-id="${fieldId}"]`) as HTMLDivElement;
                field1.style.display = visible ? "block" : "none";
        });

        window.addEventListener(fieldEvents.removeField.type, (e: Event) => {
                const fieldId = (e as ReturnType<typeof fieldEvents.removeField>).detail;

                const field1 = HTML.fieldsDiv.querySelector(`.field-div[data-field-id="${fieldId}"]`) as HTMLDivElement;
                field1.remove();

                BoardState.fields.delete(fieldId);
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

                const f = BoardState.getField(id!) as Field;
                f.name = name!;

                const fieldDiv = HTML.fieldsDiv.querySelector(`.field-div[data-field-id="${id}"]`) as HTMLDivElement;

                const inp = fieldDiv.firstChild as HTMLSpanElement;
                inp.innerText = name!;

                if (!HTML.editModal.dialog.open) return;
                HTML.editModal.title.innerText = `Edit Field: ${name}`
        });

        window.addEventListener(fieldEvents.addField.type, (e: Event) => {
                const field = (e as ReturnType<typeof fieldEvents.addField>).detail;

                BoardState.setField(field);

                addHTMLField(field);
        });

        window.addEventListener(fieldEvents.addFieldOption.type, (e: Event) => {
                const { id, fieldId, value, accountId } = (e as ReturnType<typeof fieldEvents.addFieldOption>).detail;

                const field = BoardState.getField(fieldId);
                if (!field) return;

                const option = { id, field_id: fieldId, value, account_id: accountId };

                if (!field.options) {
                        field.options = {};
                }

                field.options[id] = option;

                if (!HTML.editModal.dialog.open || HTML.editModal.idSpan.innerText != fieldId)
                        return;

                const statusOptionDiv = createStatusOption(option);
                statusOptionDiv.dataset.optionId = id;

                HTML.editModal.status.list.appendChild(statusOptionDiv);
                HTML.editModal.status.addInput.value = "";
        });

        window.addEventListener(fieldEvents.updateFieldOption.type, (e: Event) => {
                const { id, fieldId, oldValue, value, accountId } = (e as ReturnType<typeof fieldEvents.updateFieldOption>).detail;

                const field = BoardState.getField(fieldId);
                if (!field) return;

                const option = { id, field_id: fieldId, value, account_id: accountId } as FieldOption;

                field.options![id] = option

                window.dispatchEvent(entryEvents.entryChangeFieldValues({ field_id: fieldId, value, old_value: oldValue }));

                if (!HTML.editModal.dialog.open || HTML.editModal.idSpan.innerText != fieldId) return;
                const targetElem = HTML.editModal.dialog.querySelector(`[data-option-id="${id}"]`);

                const inputElem = targetElem instanceof HTMLDivElement
                        ? targetElem.querySelector("input")
                        : targetElem as HTMLInputElement;

                if (inputElem) {
                        inputElem.value = value;
                }
        });

        window.addEventListener(fieldEvents.applyPermissionRestrictions.type, () => {
                applyPermissionRestrictions();
        });

        window.addEventListener(fieldEvents.removeFieldOption.type, (e: Event) => {
                const { fieldId, id, inputValue } = (e as ReturnType<typeof fieldEvents.removeFieldOption>).detail;

                const field = BoardState.getField(fieldId);
                if (!field) return;

                delete field.options![id];

                if (!HTML.editModal.dialog.open || HTML.editModal.idSpan.innerText != fieldId) {
                        return;
                }

                HTML.editModal.status.addInput.value = inputValue ?? "";
        });

        window.addEventListener(fieldEvents.setFieldOptionVisibility.type, (e: Event) => {
                const { id, fieldId, visible } = (e as ReturnType<typeof fieldEvents.setFieldOptionVisibility>).detail;

                if (!HTML.editModal.dialog.open || HTML.editModal.idSpan.innerText != fieldId) {
                        return;
                }

                const modalOption = HTML.editModal.dialog.querySelector(`[data-option-id="${id}"]`) as HTMLDivElement;
                modalOption.style.display = visible ? "flex" : "none";
        });

        window.addEventListener(fieldEvents.clearFields.type, () => {
                if (!BoardState.isInitialized) return;
                HTML.fieldsDiv.querySelectorAll(".field-div").forEach(el => el.remove());
        });

        document.addEventListener("mousedown", (e: MouseEvent) => {
                const elem = e.target as HTMLDivElement;
                if (elem.classList[0] == "field-div") {
                        const permission = BoardState.permissionId;
                        if (permission == PermissionId.Member) return;
                        swapFieldProps = {
                                leeway: 0,
                                field1: elem,
                                field1Rect: elem.getBoundingClientRect(),
                                isDragging: true
                        };

                        document.addEventListener("mousemove", fieldDrag);
                }
                else if (elem.className == "resizer") {
                        const parentField = elem.closest(".field-div") as HTMLDivElement;
                        if (!parentField) return;

                        resizeFieldProps = {
                                field: parentField,
                                startRect: parentField.getBoundingClientRect(),
                                isResizing: true
                        };

                        document.addEventListener("mousemove", resizeField);
                }
        });

        document.addEventListener("mouseup", () => {
                document.removeEventListener("mousemove", resizeField);
                document.removeEventListener("mousemove", fieldDrag);

                if (swapFieldProps.isDragging) {
                        const permission = BoardState.permissionId;
                        if (permission == PermissionId.Member) return;

                        const fieldId1 = swapFieldProps.field1?.dataset.fieldId;
                        const fieldId2 = swapFieldProps.field2?.dataset.fieldId;

                        if ([fieldId1, fieldId2].includes(undefined) || fieldId1 == fieldId2) return;

                        switchIndex(fieldId1!, fieldId2!)
                                .catch(err => showToast(`Error switching indecies ${err}`, "error"));


                        window.dispatchEvent(entryEvents.swapDOM({ field1_id: fieldId1!, field2_id: fieldId2!, styleSwap: false }));
                }
                else if (resizeFieldProps.isResizing) {

                        const fieldId = resizeFieldProps.field!.dataset.fieldId!;
                        const newWidth = resizeFieldProps.newWidth!;

                        addDynamicFieldWidthToStorage(fieldId, newWidth);
                }

                swapFieldProps = { leeway: 0, isDragging: false };
                resizeFieldProps = { isResizing: false };
        });
}
