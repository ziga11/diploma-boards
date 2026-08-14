import type { FieldType } from "@/features/board/fields/types";

export interface CheckboxInfo {
        index: string | undefined;
        isPinnedContainer: boolean;
        isPinnedClass: boolean;
        checked: boolean;
}

export interface BaseDraftEntry {
        id: string,
        type: FieldType,
        fieldId: string,
}

export interface DraftValueEntry extends BaseDraftEntry {
        value: string,
        optionId?: never,
}

export interface DraftOptionEntry extends BaseDraftEntry {
        value?: never,
        optionId: string,
}

export type DraftEntry = DraftValueEntry | DraftOptionEntry;
