export interface Field {
        id?: string;
        board_id?: string;
        index?: number;
        account_id?: string;
        name?: string;
        type?: string;
        gen_value?: string;
        date_modified?: Date;
        fieldHelpers?: Array<FieldHelper>;
}

export interface FieldHelper {
        id?: string;
        account_id?: string;
        field_id?: string;
        value: string;
}

