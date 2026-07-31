export interface Automation {
        id?: string;
        automation_id: AutomationType;
        board_id: string;
        field_id?: string;
        account_id?: string;
        type?: string;
        date_created?: string;
        url_call: string;
}


export enum AutomationType {
        EntryChange = 1,
        ButtonPress,
        RowCreated,
        RowRemoved,
}

export interface AutomationModuleInterface {
        getAutomationById(id: string): Automation | null;
        removeAutomationById(id: string): void;
}
