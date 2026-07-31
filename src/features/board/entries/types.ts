export type Entry = {
        id?: string;
        board_id?: string;
        value?: string;
        date_modified?: Date;
        index?: number;
        type?: string;
        field_id?: string;
        account_id?: string;
        option_id?: string;
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
