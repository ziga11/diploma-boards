import type { Field } from "@/features/board/fields/types";
import type { Entry } from "./types";
import type { DraftField } from "../fields/render-types";

export const entryEvents = {
        createFieldEntries: Object.assign(
                (detail: { field: Field | DraftField, entryIds: string[] }) => new CustomEvent("entry:new-field", { detail }),
                { type: "entry:new-field" as const }
        ),

        removeFieldEntries: Object.assign(
                (detail: { fieldId: string }) => new CustomEvent("entry:remove-field", { detail }),
                { type: "entry:remove-field" as const }
        ),

        btnTriggered: Object.assign(
                (detail: HTMLDivElement) => new CustomEvent("entry:btn-triggered", { detail }),
                { type: "entry:btn-triggered" as const }
        ),

        newRow: Object.assign(
                () => new CustomEvent("entry:new-row"),
                { type: "entry:new-row" as const }
        ),

        updateRow: Object.assign(
                (detail: { entryElems: NodeListOf<HTMLDivElement | HTMLInputElement>, entries: Entry[] }) => new CustomEvent("entry:update-row", { detail }),
                { type: "entry:update-row" as const }
        ),

        realtimeNewRows: Object.assign(
                (detail: { entries: Entry[], index: number }[]) => new CustomEvent("entry:realtime-new-row", { detail }),
                { type: "entry:realtime-new-row" as const }
        ),

        setFieldIndexToEntries: Object.assign(
                (detail: { fieldId: string, index: number }) => new CustomEvent("entry:set-field-indices", { detail }),
                { type: "entry:set-field-indices" as const }
        ),

        updateFieldEntries: Object.assign(
                (detail: { entries: Entry[], index: number }) => new CustomEvent("entry:update-field-entries", { detail }),
                { type: "entry:update-field-entries" as const }
        ),

        removeEntriesUi: Object.assign(
                (detail: { fieldId?: string, indices?: number[] }) => new CustomEvent("entry:delete-field", { detail }),
                { type: "entry:delete-field" as const }
        ),

        setFieldEntriesVisibility: Object.assign(
                (detail: { fieldId: string, visible: boolean }) => new CustomEvent("entry:field-entries-visibility", { detail }),
                { type: "entry:field-entries-visibility" as const }
        ),

        setRowsVisibility: Object.assign(
                (detail: { indices: number[], visible: boolean }) => new CustomEvent("entry:hide-row", { detail }),
                { type: "entry:hide-row" as const }
        ),

        showFieldEntries: Object.assign(
                (detail: string) => new CustomEvent("entry:show-field", { detail }),
                { type: "entry:show-field" as const }
        ),

        removeRowsByIndices: Object.assign(
                (detail: { indices: number[] }) => new CustomEvent("entry:delete-rows-by-indices", { detail }),
                { type: "entry:delete-rows-by-indices" as const }
        ),

        removeSelectedRows: Object.assign(
                () => new CustomEvent("entry:delete-selected-rows"),
                { type: "entry:delete-selected-rows" as const }
        ),

        swapDOM: Object.assign(
                (detail: { field1_id: string, field2_id: string, styleSwap: boolean }) => new CustomEvent("entry:swap-dom", { detail }),
                { type: "entry:swap-dom" as const }
        ),

        visuallySwap: Object.assign(
                (detail: { field1_id: string, field2_id: string }) => new CustomEvent("entry:swap-visually", { detail }),
                { type: "entry:swap-visually" as const }
        ),

        checkChange: Object.assign(
                (detail: HTMLInputElement) => new CustomEvent("entry-check:on-change", { detail }),
                { type: "entry-check:on-change" as const }
        ),

        realtimeEntryChange: Object.assign(
                (detail: { entry_id: string, value?: string, option_id?: string }) => new CustomEvent("entry:change", { detail }),
                { type: "entry:change" as const }
        ),

        entryChangeFieldValues: Object.assign(
                (detail: { field_id: string, value: string, old_value?: string }) => new CustomEvent("entry:change-all", { detail }),
                { type: "entry:change-all" as const }
        ),

        entryCheckChangeAll: Object.assign(
                (detail: boolean) => new CustomEvent("entry-check:change-all", { detail }),
                { type: "entry-check:change-all" as const }
        ),

        copySelectedRows: Object.assign(
                () => new CustomEvent("entry:copy-row"),
                { type: "entry:copy-row" as const }
        ),

        sortChange: Object.assign(
                () => new CustomEvent("entry:sorted-by"),
                { type: "entry:sorted-by" as const }
        ),

        togglePin: Object.assign(
                (detail: HTMLDivElement) => new CustomEvent("entry:pin", { detail }),
                { type: "entry:pin" as const }
        ),

        applyPermissionRestrictions: Object.assign(
                (detail: { isMember: boolean }) => new CustomEvent("entry:set-disabled-state", { detail }),
                { type: "entry:set-disabled-state" as const }
        ),

        clearEntries: Object.assign(
                () => new CustomEvent("entry:clear-all",),
                { type: "entry:clear-all" as const }
        ),
}
