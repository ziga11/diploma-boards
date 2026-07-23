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

