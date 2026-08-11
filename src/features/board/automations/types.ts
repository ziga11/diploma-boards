export interface AutomationDB {
        id: string;
        type: AutomationType;
        board_id: string;
        field_id: string;
        account_id: string;
        url_call: string;
        date_created: string;
}

export interface AutomationInsert {
        id: string;
        type: AutomationType;
        board_id: string;
        field_id: string | null;
        account_id: string;
        url_call: string;
}

export interface BaseAutomation {
        id: string;
        boardId: string;
        accountId: string;
        dateCreated: string;
        urlCall: string;
}

export interface EntryAutomation extends BaseAutomation {
        type: AutomationType.EntryChange | AutomationType.ButtonPress;
        fieldId: string;
}

export interface RowAutomation extends BaseAutomation {
        type: AutomationType.RowCreated | AutomationType.RowRemoved;
        fieldId: never;
}

export type Automation = EntryAutomation | RowAutomation;

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
