export interface Board {
        id?: string;
        account_id?: string;
        color?: string;
        name?: string;
        date_created?: Date;
        permission_id?: number;
        is_owner?: boolean;
}

export interface BoardFetchObject {
        owned: Array<Board>,
        shared: Array<Board>,
        all: Array<Board>
}
