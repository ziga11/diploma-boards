import { supabase } from "@/core/api/supabase";
import { MasterRegistry } from "@/features/board/master-registry";
import { fieldsToken } from "@/features/board/fields/registry";
import { workspaceToken } from "@/features/board/workspace/registry";
import { EntryState } from "../state";
import { EntryWizard } from "../wizard";
import type { Entry } from "../types";
import { HTML } from "../html";
import { deleteRowsDB, insertEmptyEntryRowsDB, insertEntryRowsDB } from "./api";
import { showToast } from "@/core/utils/dom";
import { appendEntryRow, appendEntryRows, clearEntries, createEntryRow, extractEntryValue, firstDeepestNode, getEntryRowsByIndices, removeEntryRows, setEntryRowVisibility, setOptionIdsToEntryRow, setRowIndex } from "../ui";

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

export function addEntryRows(entries: Array<Entry>) {
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
        const entries: Entry[] = sortedFields.map(field => ({
                id: crypto.randomUUID(),
                field_id: field.id,
                value: "",
                type: field.type,
                date_modified: new Date(),
        }));

        const fieldEntryIdMap: Record<string, string> = Object.fromEntries(
                entries.map(entry => [entry.field_id!, entry.id!])
        );

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

export async function createEntryCopiesFromRow(entrySet: HTMLDivElement): Promise<Array<Entry>> {
        const acc = await supabase.getAccount();
        if (!acc) throw new Error("Failed to get the account");

        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("Failed to get the boardId");

        EntryState.incrementRowCount();
        const entryElems = entrySet.querySelectorAll(".entry") as NodeListOf<HTMLDivElement>;

        return Array.from(entryElems).map(entryElem => {
                const node = firstDeepestNode(entryElem) as HTMLInputElement | HTMLDivElement;
                const val = extractEntryValue(node);

                return {
                        id: crypto.randomUUID(),
                        field_id: entryElem.dataset.fieldId,
                        value: val,
                        account_id: acc.id,
                        board_id: boardId,
                        date_modified: new Date(),
                        type: entryElem.dataset.type,
                        option_id: entryElem.dataset.optionId ?? undefined,
                };
        });
}

export async function copyEntryRows(entryRows: NodeListOf<HTMLDivElement>) {
        const entryRowsArr: Entry[][] = [];
        const rows: HTMLDivElement[] = [];

        for (const row of entryRows) {
                const entries = await createEntryCopiesFromRow(row);
                rows.push(createEntryRow(entries));
                entryRowsArr.push(entries);
        }

        HTML.entriesList.append(...rows);

        insertEntryRowsDB(entryRowsArr)
                .then(indArr => {
                        indArr.forEach((index, i) => setRowIndex(rows[i], index));
                })
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

export function removeRowsByElems(entryRows: Array<HTMLDivElement>) {
        const indices = entryRows.map(e => Number(e.dataset.index));
        removeRowsByIndices(indices);
}
