import { supabase } from "@/core/api/supabase";
import type { FieldOption } from "./types";
import { BoardStore } from "../board-state";
import type { Field } from "./types";
import { getAccount } from "@/core/utils/utils";
import type { Entry } from "../entries/types";

export async function insertFieldAndEntries(type: string, fieldId: string, entryIds: Array<string>): Promise<{ field: Field, entries: Array<Entry> }> {
        const acc = await getAccount();
        const boardId = BoardStore.boardId;

        if (!boardId || !acc) throw new Error("Bug occourred, account or boardId not set");

        return await supabase.insertFieldWithEntries({
                id: fieldId,
                type: type,
                account_id: acc.id,
                board_id: boardId,
                name: "",
        } as Field, entryIds);
}

export async function fetchFields() {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error(`Cannot fetch fields, boardId not set`);

        return supabase.fetchFields(boardId);
}

export async function setFieldOptions(fields: Array<Field>) {
        const fieldOptionsMap = await supabase.fetchFieldOptions(fields!.map(e => e.id!));

        for (const field of fields) {
                const fieldOptions = fieldOptionsMap.get(field.id!) as Array<FieldOption>;

                field.options = fieldOptions ?? [];
        }
}

export async function deleteField(fieldId: string) {
        await supabase.deleteField(fieldId);
}

export async function updateFieldName(fieldId: string, newName: string) {
        await supabase.updateField(fieldId, newName);
}

export async function insertFieldOption(id: string, fieldId: string, value: string): Promise<void> {
        const acc = await getAccount();
        if (!acc) throw new Error("Not logged in");

        const option = { id, field_id: fieldId, account_id: acc.id, value } as FieldOption;

        await supabase.insertFieldOption(option);
}

export async function switchIndex(fieldId1: string, fieldId2: string) {
        const boardId = BoardStore.boardId;

        if (!boardId) throw new Error("BoardId not set");

        await supabase.switchFieldIndex({
                boardId: boardId, field1_id: fieldId1, field2_id: fieldId2
        });
}

export async function removeFieldOption(id: string | undefined) {
        if (!id || id.length == 0) throw new Error("No field option id was present, bug");
        await supabase.deleteFieldOptions({ id });
}

export async function updateFieldOption(id: string, value: string) {
        supabase.updateFieldOption(id, value);
}
