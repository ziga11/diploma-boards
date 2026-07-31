export interface Field {
        id?: string;
        board_id?: string;
        index?: number;
        account_id?: string;
        name?: string;
        type?: string;
        date_modified?: Date;
        options?: Record<string, FieldOption>;
}

export interface FieldOption {
        id?: string;
        account_id?: string;
        field_id?: string;
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
