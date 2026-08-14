import { supabase } from "@/core/api/supabase";
import type { Field, FieldOption } from "../types";
import type { Entry } from "@/features/board/entries/types";
import { MasterRegistry } from "@/features/board/master-registry";
import { workspaceToken } from "@/features/board/workspace/registry";
import type { DraftField, DraftFieldOption } from "../render-types";
import { DBToField, DBToFieldOption, FieldOptionToInsert, FieldToInsert } from "./operations";
import { DBToEntry } from "../../entries/logic/entry-actions";

export async function fetchFields(): Promise<Field[]> {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error(`Cannot fetch fields, boardId not set`);

        const fields = await supabase.fetchFields(boardId);

        return fields.map(DBToField);
}

export async function deleteFieldInDB(fieldId: string) {
        await supabase.deleteField(fieldId);
}

export async function updateFieldNameInDB(fieldId: string, newName: string) {
        await supabase.updateField(fieldId, newName);
}

export async function insertFieldAndEntriesToDB(f: DraftField | Field, entryIds: string[]): Promise<{ field: Field; entries: Entry[] }> {
        const insField = FieldToInsert(f, entryIds);

        const { field, entries } = await supabase.insertFieldWithEntries(insField);

        return { field: DBToField(field), entries: entries.map(DBToEntry) };
}

export async function switchIndexInDB(fieldId1: string, fieldId2: string) {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("BoardId not set");

        await supabase.switchFieldIndex({
                boardId: boardId, field1_id: fieldId1, field2_id: fieldId2
        });
}

export async function insertFieldOptionToDB(draftFo: DraftFieldOption): Promise<FieldOption> {
        const insFo = FieldOptionToInsert(draftFo);

        const dbFo = await supabase.insertFieldOption(insFo);

        return DBToFieldOption(dbFo);
}

export async function removeFieldOptionFromDB(id: string | undefined) {
        if (!id || id.length === 0) throw new Error("No field option id was present, bug");
        await supabase.deleteFieldOptions({ id });
}

export async function updateFieldOptionInDB(id: string, value: string) {
        await supabase.updateFieldOption(id, value);
}
