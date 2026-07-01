export interface Automation {
        id?: string;
        automation_id: AutomationId;
        board_id: string;
        field_id?: string;
        account_id?: string;
        type?: string;
        date_created?: string;
        url_call: string;
}


export enum AutomationId {
        TextChange = 1,
        StatusChange,
        ButtonPress,
        ItemCreated,
        ItemDeleted,
        AnyFieldChange,
}
