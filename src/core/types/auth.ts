export interface Permission {
        automation_id: PermissionId;
        account_id: string;
        type: string;
}

export enum PermissionId {
        Member = 1,
        Editor = 2,
        Manager = 3,
        Admin = 4,
        Owner = 5
}
