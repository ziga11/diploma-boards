import type { FieldType } from "./types";

export type DraftField = {
        id: string,
        index: number,
        name: string,
        type: FieldType,
};

export type DraftFieldOption = {
        id?: string,
        fieldId: string,
        value: string
};
