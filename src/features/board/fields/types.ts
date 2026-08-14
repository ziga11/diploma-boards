export enum FieldType { "text", "date", "button", "status" };

export interface BaseField {
        id: string;
        boardId: string;
        index: number;
        accountId: string;
        name: string;
        dateModified: Date;
}

export interface ValueField extends BaseField {
        type: FieldType.text | FieldType.date;
        options: never;
}

export interface OptionField extends BaseField {
        type: FieldType.button | FieldType.status;
        options: Record<string, FieldOption>;
}

export type Field = ValueField | OptionField;

export interface InsertField {
        field_id: string;
        entry_ids?: string[],
        board_id: string,
        name: string,
        type: string,
}

export interface DBField {
        id: string;
        board_id: string;
        index: number;
        account_id: string;
        name: string;
        date_modified: Date;
        type: string;
        options?: Record<string, DBFieldOption>;
}

export interface FieldOption {
        id: string;
        accountId: string;
        fieldId: string;
        value: string;
}

export interface InsertFieldOption {
        id?: string;
        field_id: string;
        value: string;
}

export interface DBFieldOption {
        id: string;
        account_id: string;
        field_id: string;
        value: string;
}

export interface FieldModuleInterface {
        getFieldById(fieldId: string): Field | null;
        getFieldOptions(fieldId: string): Record<string, FieldOption>;
        getOptionById(id: string): FieldOption | null;

        getAllFields(): ReadonlyArray<Field>;
        getSortedFields(): ReadonlyArray<Field>;

        getFieldCount(): number;
        hasFields(): boolean;

        getSortedByInfo(): { fieldId: string, ascending: boolean } | null
}
