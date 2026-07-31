import { supabase } from "@/core/api/supabase";
import type { Field, FieldOption } from "../types";
import type { Entry } from "@/features/board/entries/types";
import { MasterRegistry } from "@/features/board/master-registry";
import { workspaceToken } from "@/features/board/workspace/registry";

export async function fetchFields() {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error(`Cannot fetch fields, boardId not set`);
        return supabase.fetchFields(boardId);
}

export async function deleteFieldInDB(fieldId: string) {
        await supabase.deleteField(fieldId);
}

export async function updateFieldNameInDB(fieldId: string, newName: string) {
        await supabase.updateField(fieldId, newName);
}

export async function insertFieldAndEntriesToDB(type: string, fieldId: string, entryIds: string[]): Promise<{ field: Field; entries: Entry[] }> {
        const acc = await supabase.getAccount();
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();

        if (!boardId || !acc) throw new Error("Bug occurred, account or boardId not set");

        return await supabase.insertFieldWithEntries({
                id: fieldId,
                type: type,
                account_id: acc.id,
                board_id: boardId,
                name: "",
        } as Field, entryIds);
}

export async function switchIndexInDB(fieldId1: string, fieldId2: string) {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("BoardId not set");

        await supabase.switchFieldIndex({
                boardId: boardId, field1_id: fieldId1, field2_id: fieldId2
        });
}

export async function insertFieldOptionToDB(id: string, fieldId: string, value: string): Promise<void> {
        const acc = await supabase.getAccount();
        if (!acc) throw new Error("Not logged in");

        const option = { id, field_id: fieldId, account_id: acc.id, value } as FieldOption;
        await supabase.insertFieldOption(option);
}

export async function removeFieldOptionFromDB(id: string | undefined) {
        if (!id || id.length === 0) throw new Error("No field option id was present, bug");
        await supabase.deleteFieldOptions({ id });
}

export async function updateFieldOptionInDB(id: string, value: string) {
        await supabase.updateFieldOption(id, value);
}
