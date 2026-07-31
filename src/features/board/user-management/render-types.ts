export interface CollaboratorViewModel {
        id: string;
        name: string;
        email: string;
        avatarUrl: string;
        role: string;
        permissionId: number;
        formattedDate: string;
        isMe: boolean;
        canChangePerm: boolean;
        canRemove: boolean;
}
