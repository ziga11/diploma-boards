import { showToast } from "@/core/utils/dom";
import { entryEvents } from "@/features/board/entries/custom-events";
import { FieldsState } from "../state";
import { FieldType, type DBField, type Field, type FieldOption, type DBFieldOption, type InsertField, type InsertFieldOption } from "../types";
import { addHTMLField, closeNewFieldMenu, removeField, updateFieldNameUi } from "../ui/field";
import { insertFieldAndEntriesToDB, deleteFieldInDB, insertFieldOptionToDB, removeFieldOptionFromDB, updateFieldOptionInDB, updateFieldNameInDB } from "./api";
import { fieldEvents } from "../custom-events";
import { HTML } from "../html";
import { setEditFieldOptionVisibility, updateEditFieldOption } from "../ui/option";
import { MasterRegistry } from "@/features/board/master-registry";
import { entriesToken } from "@/features/board/entries/registry";
import { workspaceToken } from "@/features/board/workspace/registry";
import type { DraftField, DraftFieldOption } from "../render-types";
import { supabase } from "@/core/api/supabase";

export function restoreBoardSorting(): void {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) return;

        const sortFieldId = localStorage.getItem(`${boardId}-sort-field-id`);
        if (sortFieldId) {
                const sortAscending = localStorage.getItem(`${boardId}-sort-ascending`) === "t";
                FieldsState.setSortingInfo(sortFieldId, sortAscending);
        }
}

export async function handleCreateField(type: FieldType) {
        const tempFieldId = crypto.randomUUID();

        const tempField = {
                id: tempFieldId,
                type,
                index: 10000,
                name: "",
        } as DraftField;

        const rowCount = MasterRegistry.get(entriesToken).getRowCount().all;
        const entryIds = Array.from({ length: rowCount }, () => crypto.randomUUID());

        closeNewFieldMenu();
        const fieldElem = addHTMLField(tempField);

        FieldsState.addField(tempField as Field);

        window.dispatchEvent(entryEvents.createFieldEntries({ field: tempField, entryIds }));

        try {
                const data = await insertFieldAndEntriesToDB(tempField, entryIds);

                FieldsState.updateField(data.field.id, data.field);
                updateFieldOrder(fieldElem, data.field.index!);

                window.dispatchEvent(entryEvents.setFieldIndexToEntries({
                        fieldId: data.field.id!,
                        index: data.field.index!
                }));
        } catch (err: any) {
                removeField(fieldElem);
                window.dispatchEvent(entryEvents.removeFieldEntries({ fieldId: tempFieldId }));
                console.error(`Failed to add new field: ${err.message || err}`);

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

        const id = crypto.randomUUID();

        const acc = await supabase.getAccount();
        if (!acc || !acc.id) {
                return;
        }

        window.dispatchEvent(fieldEvents.addFieldOption({ id: id, fieldId, value, accountId: acc.id! }));

        const draftFo = { id, value, fieldId } as DraftFieldOption;

        try {
                await insertFieldOptionToDB(draftFo);
        } catch (err: any) {
                window.dispatchEvent(fieldEvents.removeFieldOption({ id: id, fieldId, inputValue: value }));
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
        field.options![id].accountId = accountId ?? value;

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

export function DBToField(db: DBField): Field {
        let options = {} as Record<string, FieldOption>;

        if (db.options) {
                for (const [key, val] of Object.entries(db.options)) {
                        options[key] = DBToFieldOption(val);
                }
        }

        return {
                id: db.id,
                accountId: db.account_id,
                boardId: db.board_id,
                name: db.name,
                index: db.index,
                options: options,
                type: FieldType[db.type as keyof typeof FieldType],
                dateModified: db.date_modified,
        } as Field;
}

export function FieldToInsert(f: Field | DraftField, entryIds?: string[]): InsertField {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("board ID not set");

        return {
                field_id: f.id,
                type: FieldType[f.type],
                entry_ids: entryIds,
                name: f.name,
                board_id: boardId,
        };
}

export function FieldOptionToInsert(fo: FieldOption | DraftFieldOption): InsertFieldOption {
        return {
                id: fo.id,
                value: fo.value,
                field_id: fo.fieldId
        }
}

export function DBToFieldOption(db: DBFieldOption): FieldOption {
        return {
                id: db.id,
                value: db.value,
                accountId: db.account_id,
                fieldId: db.field_id
        }
}
