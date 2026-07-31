import { PermissionId } from "@/core/types/auth";

export interface Board {
        id?: string;
        color?: string;
        name?: string;
        date_created?: Date;
        permission_id?: number;
        deleted?: boolean;
}

export interface WorkspaceModuleInterface {
        getBoard(): Board | null;
        getBoardId(): string | null;

        getPermissionId(): PermissionId | null;
        setPermissionId(permissionId: PermissionId): void;

        setDeleted(deleted: boolean): void;
}
