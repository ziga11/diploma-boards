import type { Field, FieldHelper } from "./types";

export const fieldEvents = {
        checkChange: Object.assign(
                (detail: boolean) => new CustomEvent("field-check:change", { detail }),
                { type: "field-check:change" as const }
        ),

        swapField: Object.assign(
                (detail: { fieldId: string, startIndex: number, finalIndex: number }) => new CustomEvent("field:swap", { detail }),
                { type: "field:swap" as const }
        ),

        disposeAll: Object.assign(
                () => new CustomEvent("field:dispose-all"),
                { type: "field:dispose-all" as const }
        ),

        realtimeFieldNameUpdate: Object.assign(
                (detail: Field) => new CustomEvent("field:update-name", { detail }),
                { type: "field:update-name" as const }
        ),

        realtimeAddField: Object.assign(
                (detail: Field) => new CustomEvent("field:add", { detail }),
                { type: "field:add" as const }
        ),

        realtimeRemoveField: Object.assign(
                (detail: string) => new CustomEvent("field:remove", { detail }),
                { type: "field:remove" as const }
        ),

        realtimeAddFieldHelper: Object.assign(
                (detail: FieldHelper) => new CustomEvent("field-helper:add", { detail }),
                { type: "field-helper:add" as const }
        ),

        realtimeUpdateFieldHelper: Object.assign(
                (detail: FieldHelper) => new CustomEvent("field-helper:update", { detail }),
                { type: "field-helper:update" as const }
        ),

        realtimeRemoveFieldHelper: Object.assign(
                (detail: { fieldId: string, helperId: string }) => new CustomEvent("field-helper:remove", { detail }),
                { type: "field-helper:remove" as const }
        ),
}
