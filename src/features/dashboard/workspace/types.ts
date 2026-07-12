export interface Board {
        id?: string;
        color?: string;
        name?: string;
        date_created?: Date;
        permission_id?: number;
        is_owner?: boolean;
        deleted?: boolean;
}

export interface BoardFetchObject {
        owned: Array<Board>,
        shared: Array<Board>,
        deleted: Array<Board>,
        all: Array<Board>
}
