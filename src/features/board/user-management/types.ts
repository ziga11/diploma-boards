import { PermissionId } from "@/core/types/auth";

export interface InsertNotification {
        id?: string;
        from_acc_id: string;
        to_acc_email?: string;
        message: string;
        state: 'pending';
        type: 'alert' | 'invitation';
        board_id?: string;
        permission_id?: number;
}

export interface ViewNotification {
        id: string;
        from_acc: Account;
        to_acc: Account;
        direction: 'sent' | 'received';
        state: 'accepted' | 'pending' | 'dismissed' | 'declined';
        message: string;
        created_at: Date;
        permission_id?: number;
        board_id?: string;
}

export interface NotificationFetchObject {
        sent: ViewNotification[];
        received: ViewNotification[];
        all: ViewNotification[];
}

export interface Collaborator {
        account_id: string;
        name: string,
        avatar_url: string,
        email: string,
        permission_id: PermissionId;
        added_at: Date;
}

export interface InvitedCollaborator {
        invited_by: Account,
        permission_id: PermissionId,
        to_email: string,
        created_at: Date
}

export interface BoardAccLink {
        id: string;
        created_at: Date;
        board_id: string;
        account_id: string;
        permission_id: number;
}

export interface UsersModuleInterface {
        getCollaborators(): ReadonlyArray<Collaborator>;
        addCollaborator(collaborator: Collaborator): void;
        updateCollaboratorPermission(accountId: string, permissionId: PermissionId): void;
        removeCollaborator(accountId: string): void;

        getInvitedCollaborators(): ReadonlyArray<InvitedCollaborator>;
        addInvitedCollaborator(collaborator: InvitedCollaborator): void;
        removeInvitedCollaborator(email: string): void;
}
