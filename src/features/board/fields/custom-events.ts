import type { Field } from "./types";

export const fieldEvents = {
        checkChange: Object.assign(
                (detail: boolean) => new CustomEvent("field-check:change", { detail }),
                { type: "field-check:change" as const }
        ),

        disposeAll: Object.assign(
                () => new CustomEvent("field:dispose-all"),
                { type: "field:dispose-all" as const }
        ),

        realtimeFieldNameUpdate: Object.assign(
                (detail: Field) => new CustomEvent("realtime-field:update-name", { detail }),
                { type: "realtime-field:update-name" as const }
        ),

        realtimeAddField: Object.assign(
                (detail: Field) => new CustomEvent("realtime-field:add", { detail }),
                { type: "realtime-field:add" as const }
        ),

        realtimeRemoveField: Object.assign(
                (detail: string) => new CustomEvent("realtime-field:remove", { detail }),
                { type: "realtime-field:remove" as const }
        ),
}
