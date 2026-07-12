import { supabase } from "@/core/api/supabase";
import type { FieldHelper } from "./types";
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

export async function setFieldHelpers(fields: Array<Field>) {
        const fieldHelpersMap = await supabase.fetchFieldHelpers(fields!.map(e => e.id!));

        for (const field of fields) {
                const fieldHelpers = fieldHelpersMap.get(field.id!) as Array<FieldHelper>;

                field.fieldHelpers = fieldHelpers ?? [];
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

        const fieldHelper = { id, field_id: fieldId, account_id: acc.id, value } as FieldHelper;

        await supabase.insertFieldHelper(fieldHelper);
}

export async function switchIndex(fieldId: string, startIndex: number, finalIndex: number) {
        const boardId = BoardStore.boardId;

        if (!boardId) throw new Error("BoardId not set");

        await supabase.switchFieldIndex({
                boardId: boardId, fieldId: fieldId, oldIndex: startIndex, newIndex: finalIndex
        });
}

export async function removeFieldOption(id: string | undefined) {
        if (!id || id.length == 0) throw new Error("No field helper id was present, bug");
        await supabase.deleteFieldHelpers({ id });
}

export async function updateFieldOption({ fieldId, fieldHelperId, value }: { fieldId?: string, fieldHelperId: string, value: string }) {
        const field = BoardStore.getField(fieldId!);
        if (!field) {
                throw new Error(`Failed to update field option, field not found`);
        }
        if (!field.fieldHelpers || !field.fieldHelpers.length) {
                throw new Error(`No existing field helpers`);
        }

        const fieldHelper = field.fieldHelpers.find(fh => fh.id == fieldHelperId);
        if (!fieldHelper) throw new Error("Failed to find field helper, bug");

        supabase.updateFieldHelper(value, { fieldId, id: fieldHelper.id }).then(_ => fieldHelper.value = value);
}
