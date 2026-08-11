interface BaseEntry {
        id: string;
        boardId: string;
        dateModified: Date;
        index: number;
        type: string;
        fieldId: string;
        accountId: string;
}

export interface OptionEntry extends BaseEntry {
        optionId: string;
        value?: never;
}

export interface ValueEntry extends BaseEntry {
        value: string;
        optionId?: never;
}

export type Entry = OptionEntry | ValueEntry;

export type InsertEntry = {
        id: string;
        board_id: string;
        field_id: string;
        account_id: string;
        option_id?: string;
        value?: string;
}

export type DBEntry = {
        id: string,
        board_id: string,
        field_id: string,
        date_modified: Date,
        index: number,
        account_id: string,
        value?: string,
        option_id?: string,
}

export interface EntryModuleInterface {
        getRowCount(): { all: number, rendered: number };
}

export interface FetchEntriesParams {
        boardId: string;
        fieldCount: number;
        searchQuery: string | null;
        sortedBy: { fieldId: string; ascending: boolean } | null;
}
