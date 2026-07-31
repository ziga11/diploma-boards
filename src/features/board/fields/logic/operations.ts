import { showToast } from "@/core/utils/dom";
import { entryEvents } from "@/features/board/entries/custom-events";
import { FieldsState } from "../state";
import type { Field } from "../types";
import { addHTMLField, closeNewFieldMenu, removeField, updateFieldNameUi } from "../ui/field";
import { insertFieldAndEntriesToDB, deleteFieldInDB, insertFieldOptionToDB, removeFieldOptionFromDB, updateFieldOptionInDB, updateFieldNameInDB } from "./api";
import { fieldEvents } from "../custom-events";
import { HTML } from "../html";
import { setEditFieldOptionVisibility, updateEditFieldOption } from "../ui/option";
import { MasterRegistry } from "@/features/board/master-registry";
import { entriesToken } from "@/features/board/entries/registry";
import { workspaceToken } from "@/features/board/workspace/registry";

export function restoreBoardSorting(): void {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) return;

        const sortFieldId = localStorage.getItem(`${boardId}-sort-field-id`);
        if (sortFieldId) {
                const sortAscending = localStorage.getItem(`${boardId}-sort-ascending`) === "t";
                FieldsState.setSortingInfo(sortFieldId, sortAscending);
        }
}

export async function handleCreateField(type: string) {
        const tempFieldId = crypto.randomUUID();
        const tempField: Field = { id: tempFieldId, type: type, index: 10000 };

        const rowCount = MasterRegistry.get(entriesToken).getRowCount().all;
        const entryIds = Array.from({ length: rowCount }, () => crypto.randomUUID());

        closeNewFieldMenu();
        const fieldElem = addHTMLField(tempField);

        window.dispatchEvent(entryEvents.createFieldEntries({ field: tempField, entryIds }));

        try {
                const data = await insertFieldAndEntriesToDB(type, tempFieldId, entryIds);

                FieldsState.addField(data.field);
                updateFieldOrder(fieldElem, data.field.index!);

                window.dispatchEvent(
                        entryEvents.setFieldIndexToEntries({
                                fieldId: data.field.id!,
                                index: data.field.index!
                        })
                );
        } catch (err: any) {
                removeField(fieldElem);
                window.dispatchEvent(entryEvents.removeFieldEntries({ fieldId: tempFieldId }));
                showToast(`Failed to add new field: ${err.message || err}`, "error");
        }
}

export async function handleDeleteField(fieldId: string): Promise<void> {
        window.dispatchEvent(entryEvents.setFieldEntriesVisibility({ fieldId, visible: false }));
        window.dispatchEvent(fieldEvents.setFieldVisibility({ fieldId, visible: false }));

        try {
                await deleteFieldInDB(fieldId);
                window.dispatchEvent(entryEvents.removeEntriesUi({ fieldId }));
                window.dispatchEvent(fieldEvents.removeField(fieldId));
        } catch (err: any) {
                window.dispatchEvent(fieldEvents.setFieldVisibility({ fieldId, visible: true }));
                window.dispatchEvent(entryEvents.setFieldEntriesVisibility({ fieldId, visible: true }));
                showToast(`Failed to remove field: ${err.message || err}`, "error");
        }
}

export function handleFieldNameChange() {
        const newName = HTML.editModal.input.value;
        const fieldId = HTML.editModal.idSpan.innerText;
        if (HTML.editModal.input.dataset.dbValue === newName || !fieldId) return;

        window.dispatchEvent(fieldEvents.fieldNameUpdate({ id: fieldId, name: newName }));

        updateFieldNameInDB(fieldId, newName)
                .then(() => (HTML.editModal.input.dataset.dbValue = newName))
                .catch(err => {
                        const oldName = HTML.editModal.input.dataset.dbValue!;
                        window.dispatchEvent(fieldEvents.fieldNameUpdate({ id: fieldId, name: oldName }));
                        showToast(`Failed to change the field name: ${err}`, "error");
                });
}

export function updateFieldName(id: string, name: string) {
        FieldsState.updateFieldName(id, name);
        updateFieldNameUi(id, name);
}

export function updateFieldOrder(fieldDiv: HTMLDivElement, index: number) {
        fieldDiv.dataset.order = `${index}`;
}


/*INFO: Option */
export async function handleAddFieldOption(fieldId: string, value: string): Promise<void> {
        if (!value) {
                showToast("Value of the option cannot be empty", "error");
                return;
        }

        const optionId = crypto.randomUUID();
        window.dispatchEvent(fieldEvents.addFieldOption({ id: optionId, fieldId, value }));

        try {
                await insertFieldOptionToDB(optionId, fieldId, value);
        } catch (err: any) {
                window.dispatchEvent(fieldEvents.removeFieldOption({ id: optionId, fieldId, inputValue: value }));
                showToast(`Failed to add option: ${err.message || err}`, "error");
        }
}

export async function handleRemoveFieldOption(id: string, fieldId: string): Promise<void> {
        setEditFieldOptionVisibility(id, false);

        try {
                await removeFieldOptionFromDB(id);
                removeOptionById(id, fieldId);
        } catch (err: any) {
                setEditFieldOptionVisibility(id, true);
                showToast(`Failed to remove status option: ${err.message || err}`, "error");
        }
}

export function removeOptionById(id: string, fieldId: string) {
        FieldsState.removeOption(id, fieldId);
}

export function updateFieldOption(id: string, fieldId: string, value: string, oldValue?: string, accountId?: string) {
        const field = FieldsState.getFieldById(fieldId);
        if (!field) return;

        field.options![id].value = value;
        field.options![id].account_id = accountId ?? value;

        window.dispatchEvent(entryEvents.entryChangeFieldValues({ field_id: fieldId, value: value, old_value: oldValue }));

        if (!HTML.editModal.dialog.open || HTML.editModal.idSpan.innerText !== fieldId) return;

        updateEditFieldOption(id, value);
}

export async function handleButtonOptionChange() {
        const fieldId = HTML.editModal.idSpan.innerText;
        const input = HTML.editModal.button.input;
        const dbValue = input.dataset.dbValue!;
        const value = input.value;

        if (dbValue === value) return;

        const id = input.dataset.optionId;
        if (!id) return;

        window.dispatchEvent(fieldEvents.updateFieldOption({ id, fieldId, value }));

        try {
                await updateFieldOptionInDB(id, value);
        } catch (err) {
                window.dispatchEvent(fieldEvents.updateFieldOption({ id, fieldId, value: dbValue }));
                console.error(err);
                showToast("Failed to update field option text", "error");
        }
}

export async function handleStatusOptionChange(statusDiv: HTMLDivElement, newValue: string) {
        const id = statusDiv.dataset.optionId;
        const fieldId = HTML.editModal.idSpan.innerText;
        const oldValue = statusDiv.dataset.dbValue;

        if (newValue === oldValue || !id) return;

        window.dispatchEvent(fieldEvents.updateFieldOption({ id, oldValue, value: newValue, fieldId }));

        try {
                await updateFieldOptionInDB(id, newValue);
        } catch (err) {
                console.error(err);
                showToast("Failed to update field option text", "error");
                window.dispatchEvent(fieldEvents.updateFieldOption({ id, oldValue, value: oldValue!, fieldId }));
        }
}
