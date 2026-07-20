import type { Field } from "./types";

export const fieldEvents = {
        checkChange: Object.assign(
                (detail: boolean) => new CustomEvent("field-check:change", { detail }),
                { type: "field-check:change" as const }
        ),

        realtimeSwapField: Object.assign(
                (detail: { field1_id: string, field2_id: string }) => new CustomEvent("field:swap", { detail }),
                { type: "field:swap" as const }
        ),

        disposeAll: Object.assign(
                () => new CustomEvent("field:dispose-all"),
                { type: "field:dispose-all" as const }
        ),

        fieldNameUpdate: Object.assign(
                (detail: { id: string, name: string }) => new CustomEvent("field:update-name", { detail }),
                { type: "field:update-name" as const }
        ),

        addField: Object.assign(
                (detail: Field) => new CustomEvent("field:add", { detail }),
                { type: "field:add" as const }
        ),

        removeField: Object.assign(
                (detail: string) => new CustomEvent("field:remove", { detail }),
                { type: "field:remove" as const }
        ),

        setFieldVisibility: Object.assign(
                (detail: { fieldId: string, visible: boolean }) => new CustomEvent("field:set-visibility", { detail }),
                { type: "field:set-visibility" as const }
        ),

        applyPermissionRestrictions: Object.assign(
                () => new CustomEvent("field:apply-permission-restrictions"),
                { type: "field:apply-permission-restrictions" }
        ),

        addFieldOption: Object.assign(
                (detail: { id: string, fieldId: string, value: string, accountId?: string }) => new CustomEvent("field-option:add", { detail }),
                { type: "field-option:add" as const }
        ),

        updateFieldOption: Object.assign(
                (detail: { id: string, fieldId: string, oldValue?: string, value: string, accountId?: string }) => new CustomEvent("field-option:update", { detail }),
                { type: "field-option:update" as const }
        ),

        removeFieldOption: Object.assign(
                (detail: { id: string, fieldId: string, inputValue?: string }) => new CustomEvent("field-option:remove", { detail }),
                { type: "field-option:remove" as const }
        ),

        setFieldOptionVisibility: Object.assign(
                (detail: { id: string, fieldId: string, visible: boolean }) => new CustomEvent("field-option:remove", { detail }),
                { type: "field-option:remove" as const }
        ),
}
