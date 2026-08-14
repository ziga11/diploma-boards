import type { Field, FieldOption } from "./types";

interface FieldsState {
        isInitialized: boolean;
        fields: Map<string, Field>;
        sortedBy: { fieldId: string, ascending: boolean } | null,
}

const state: FieldsState = {
        isInitialized: false,
        fields: new Map(),
        sortedBy: null,
};

export const FieldsState = {
        isInitialized() { return state.isInitialized; },

        setInitalized() { state.isInitialized = true; },

        setFields(fields: Field[]) {
                state.fields = new Map(fields.map((a) => [a.id!, a]));
        },

        addField(a: Field) {
                if (a.id) state.fields.set(a.id, a);
        },

        updateField(id: string, field: Field) {
                state.fields.set(id, field);
        },

        updateFieldName(id: string, name: string) {
                const field = state.fields.get(id);
                if (!field) return;

                field.name = name;
        },

        removeField(id: string) {
                state.fields.delete(id);
        },

        getFieldById(id: string): Field | null {
                return state.fields.get(id) || null;
        },

        getAllFields(): ReadonlyArray<Field> {
                return Array.from(state.fields.values());
        },

        getSortedFields(): ReadonlyArray<Field> {
                return Array.from(state.fields.values())
                        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
        },

        getOptions(fieldId: string): Record<string, FieldOption> {
                return state.fields.get(fieldId)?.options ?? {};
        },

        getOptionById(id: string): FieldOption | null {
                for (const field of state.fields.values()) {
                        const option = (field.options ?? {})[id];
                        if (option) return option;
                }
                return null;
        },

        getSortingInfo() {
                return state.sortedBy;
        },

        setSortingInfo(fieldId: string, ascending: boolean) {
                state.sortedBy = { fieldId, ascending };
        },

        removeSortingInfo() {
                state.sortedBy = null;
        },

        addOption(option: FieldOption) {
                if (!option.fieldId || !option.id) return;

                const field = state.fields.get(option.fieldId);
                if (!field) return;

                if (!field.options) field.options = {};

                field.options[option.id] = option;
        },

        removeOption(id: string, fieldId: string) {
                const field = state.fields.get(fieldId);
                if (!field) return;

                delete field.options![id];
        },

        updateOption(id: string, fieldId: string, value: string) {
                const field = state.fields.get(fieldId);
                if (!field || !field.options) return;

                field.options[id].value = value;
        },

        fieldCount() {
                return state.fields.size;
        },

        hasFields() {
                return state.fields.size > 0;
        },

        clear() {
                state.fields.clear();
        },
};
