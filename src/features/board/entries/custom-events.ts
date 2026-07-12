import type { Field } from "../fields/types";
import type { Entry } from "./types";

export const entryEvents = {
        statusClicked: Object.assign(
                (detail: HTMLDivElement) => new CustomEvent("entry:status-clicked", { detail }),
                { type: "entry:status-clicked" as const }
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
                (detail: { entryElems: NodeListOf<HTMLDivElement | HTMLInputElement>, entries: Array<Entry> }) => new CustomEvent("entry:update-row", { detail }),
                { type: "entry:update-row" as const }
        ),

        realtimeNewRows: Object.assign(
                (detail: Array<Entry>) => new CustomEvent("entry:realtime-new-row", { detail }),
                { type: "entry:realtime-new-row" as const }
        ),

        newFieldEntries: Object.assign(
                (detail: { field: Field, entryIds: Array<string> }) => new CustomEvent("entry:new-field", { detail }),
                { type: "entry:new-field" as const }
        ),

        updateFieldEntries: Object.assign(
                (detail: { entries: Array<Entry>, index: number }) => new CustomEvent("entry:update-field-entries", { detail }),
                { type: "entry:update-field-entries" as const }
        ),

        realtimeRemoveEntries: Object.assign(
                (detail: { fieldId?: string, indices?: Array<number> }) => new CustomEvent("entry:delete-field", { detail }),
                { type: "entry:delete-field" as const }
        ),

        hideFieldEntries: Object.assign(
                (detail: { fieldId?: string, index?: number }) => new CustomEvent("entry:hide-field", { detail }),
                { type: "entry:hide-field" as const }
        ),

        showFieldEntries: Object.assign(
                (detail: string) => new CustomEvent("entry:show-field", { detail }),
                { type: "entry:show-field" as const }
        ),

        removeSelected: Object.assign(
                () => new CustomEvent("entry:delete-selected"),
                { type: "entry:delete-selected" as const }
        ),

        swapDOM: Object.assign(
                (detail: { finalIndex: number, increase: boolean }) => new CustomEvent("entry:swap-dom", { detail }),
                { type: "entry:swap-dom" as const }
        ),

        visuallySwap: Object.assign(
                (detail: { startIndex: number, finalIndex: number, increase: boolean }) => new CustomEvent("entry:swap-visually", { detail }),
                { type: "entry:swap-visually" as const }
        ),

        checkChange: Object.assign(
                (detail: HTMLInputElement) => new CustomEvent("entry-check:on-change", { detail }),
                { type: "entry-check:on-change" as const }
        ),

        realtimeEntryChange: Object.assign(
                (detail: { entryId: string, value: string }) => new CustomEvent("entry:change", { detail }),
                { type: "entry:change" as const }
        ),

        entryChangeFieldValues: Object.assign(
                (detail: { fieldId: string, value: string, oldValue?: string }) => new CustomEvent("entry:change-all", { detail }),
                { type: "entry:change-all" as const }
        ),

        entryCheckChangeAll: Object.assign(
                (detail: boolean) => new CustomEvent("entry-check:change-all", { detail }),
                { type: "entry-check:change-all" as const }
        ),

        copyRow: Object.assign(
                (detail: NodeListOf<HTMLDivElement>) => new CustomEvent("entry:copy-row", { detail }),
                { type: "entry:copy-row" as const }
        ),

        disposeAll: Object.assign(
                () => new CustomEvent("entry:dispose-all"),
                { type: "entry:dispose-all" as const }
        ),

        sortChange: Object.assign(
                () => new CustomEvent("entry:sorted-by"),
                { type: "entry:sorted-by" as const }
        ),

        togglePin: Object.assign(
                (detail: HTMLDivElement) => new CustomEvent("entry:pin", { detail }),
                { type: "entry:pin" as const }
        ),
}
