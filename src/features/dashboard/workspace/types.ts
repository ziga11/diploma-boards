export interface Board {
        id?: string;
        color?: string;
        name?: string;
        date_created?: Date;
        permission_id?: number;
        deleted?: boolean;
}

export interface BoardFetchObject {
        owned: Board[],
        shared: Board[],
        deleted: Board[],
        all: Board[]
}
