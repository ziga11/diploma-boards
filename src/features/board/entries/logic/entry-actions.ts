import { supabase } from "@/core/api/supabase";
import { MasterRegistry } from "@/features/board/master-registry";
import { fieldsToken } from "@/features/board/fields/registry";
import { workspaceToken } from "@/features/board/workspace/registry";
import { EntryState } from "../state";
import { EntryWizard } from "../wizard";
import type { DBEntry, Entry, InsertEntry, OptionEntry, ValueEntry } from "../types";
import { HTML } from "../html";
import { deleteRowsDB, insertEmptyEntryRowsDB, insertEntryRowsDB } from "./api";
import { showToast } from "@/core/utils/dom";
import { appendEntryRow, appendEntryRows, clearEntries, createEntryRow, getEntryRowsByIndices, removeEntryRows, setEntryRowVisibility, setOptionIdsToEntryRow, setRowIndex } from "../ui";
import { FieldType } from "../../fields/types";

export async function initEntriesView() {
        clearEntries();
        EntryWizard.initScrollLoader();

        const fieldCount = MasterRegistry.get(fieldsToken).getFieldCount();
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error(`Failed to fetch entries, board id not set`);

        if (fieldCount > 0) {
                const allEntryCount = await supabase.fetchEntryCount(boardId);
                EntryState.setRowCount({ all: allEntryCount / fieldCount });
        } else {
                EntryState.setRowCount({ all: 0 });
        }
}

export function addEntryRows(entries: Entry[]) {
        const fieldCount = MasterRegistry.get(fieldsToken).getFieldCount();
        const entryRows: Entry[][] = [];

        for (let i = 0; i < entries.length; i += fieldCount) {
                entryRows.push(entries.slice(i, i + fieldCount));
        }

        appendEntryRows(entryRows);
        EntryState.setRowCount({ rendered: EntryState.getRowCount().rendered + entryRows.length });
}

export function createNewEmptyRow() {
        const fieldCount = MasterRegistry.get(fieldsToken).getFieldCount();
        if (fieldCount === 0) {
                showToast("Cannot make a new row, no existing fields", "error");
                return;
        }

        EntryState.incrementRowCount();

        const sortedFields = MasterRegistry.get(fieldsToken).getSortedFields();

        const entries = sortedFields.map(field => ({
                id: crypto.randomUUID(),
                fieldId: field.id,
                value: "",
                type: field.type,
                dateModified: new Date(),
        })) as Entry[];

        const fieldEntryIdMap: Record<string, string> =
                Object.fromEntries(entries.map(entry => [entry.fieldId!, entry.id!]));

        const row = appendEntryRow(entries);

        insertEmptyEntryRowsDB([fieldEntryIdMap])
                .then(([rowData]) => {
                        setRowIndex(row, rowData.row_index);
                        setOptionIdsToEntryRow(row, rowData.entries);
                })
                .catch(err => {
                        row.remove();
                        EntryState.decrementRowCount();
                        showToast(`Failed to create entry row: ${err}`, "error");
                });
}

export async function createEntryCopiesFromRow(entrySet: HTMLDivElement): Promise<Entry[]> {
        const acc = await supabase.getAccount();
        if (!acc || !acc.id) throw new Error("Failed to get the account");

        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("Failed to get the boardId");

        const entryElems = entrySet.querySelectorAll(".entry") as NodeListOf<HTMLDivElement>;

        let entries: Entry[] = [];

        for (const elem of entryElems) {
                const type = elem.dataset.type;
                const fieldId = elem.dataset.fieldId

                if (!fieldId || !type) continue;

                let entry = {
                        id: crypto.randomUUID(),
                        fieldId: fieldId,
                        index: 1000,
                        accountId: acc.id,
                        boardId: boardId,
                        dateModified: new Date(),
                        type: FieldType[type as keyof typeof FieldType],
                } as Entry;

                if (elem instanceof HTMLInputElement) {
                        entry.value = elem.value;
                }
                else {
                        const optionId = elem.dataset.optionId;
                        if (!optionId) continue;

                        entry.optionId = optionId;
                }

                entries.push(entry)
        }

        return entries;
}

export async function copyEntryRows(entryRows: NodeListOf<HTMLDivElement>) {
        const entryRowsArr: Entry[][] = [];
        const rows: HTMLDivElement[] = [];

        for (const row of entryRows) {
                const entries = await createEntryCopiesFromRow(row);

                rows.push(createEntryRow(entries));
                entryRowsArr.push(entries);
        }

        EntryState.incrementRowCount(rows.length);

        HTML.entriesList.append(...rows);

        insertEntryRowsDB(entryRowsArr)
                .then(indArr => indArr.forEach((index, i) => setRowIndex(rows[i], index)))
                .catch(() => {
                        removeEntryRows(rows);
                        const { rendered, all } = EntryState.getRowCount();
                        EntryState.setRowCount({ rendered: rendered - rows.length, all: all - rows.length });
                });
}

export function removeRowsByIndices(indices: number[]) {
        const entryRows = getEntryRowsByIndices(indices);
        entryRows.forEach(e => setEntryRowVisibility({ row: e, visible: false }));

        deleteRowsDB(indices)
                .then(() => {
                        removeEntryRows(entryRows);
                        const { rendered, all } = EntryState.getRowCount();
                        EntryState.setRowCount({
                                rendered: rendered - indices.length,
                                all: all - indices.length
                        });
                })
                .catch(err => {
                        entryRows.forEach(e => setEntryRowVisibility({ row: e, visible: true }));
                        showToast(`Failed to delete rows: ${err}`, "error");
                });
}

export function removeRowsByElems(entryRows: HTMLDivElement[]) {
        const indices = entryRows.map(e => Number(e.dataset.index));
        removeRowsByIndices(indices);
}

export function EntryToInsert(entry: Entry): InsertEntry {
        return {
                id: entry.id,
                board_id: entry.boardId,
                field_id: entry.fieldId,
                account_id: entry.accountId,
                option_id: entry.optionId,
                value: entry.value,
        };
}

export function DBToEntry(db: DBEntry): Entry {
        const field = MasterRegistry.get(fieldsToken).getFieldById(db.field_id);
        if (!field) throw new Error(`field with id ${db.field_id} does not exist`);

        const type = field.type;

        if (type === FieldType.status || type === FieldType.button) {
                return {
                        id: db.id,
                        fieldId: db.field_id,
                        accountId: db.account_id,
                        boardId: db.board_id,
                        optionId: db.option_id,
                        dateModified: db.date_modified,
                        index: db.index,
                        type: field.type!,
                } as OptionEntry;
        }
        else if (type === FieldType.text || type === FieldType.date) {
                return {
                        id: db.id,
                        fieldId: db.field_id,
                        accountId: db.account_id,
                        boardId: db.board_id,
                        value: db.value,
                        dateModified: db.date_modified,
                        index: db.index,
                        type: field.type!,
                } as ValueEntry;
        }


        throw new Error(`field type (${type}) does not exist`);
}
