import { supabase } from "@/core/api/supabase";
import { MasterRegistry } from "@/features/board/master-registry";
import { workspaceToken } from "@/features/board/workspace/registry";
import { PermissionId } from "@/core/types/auth";

export async function inviteCollaboratorDB(id: string, boardId: string, email: string, permissionId: PermissionId) {
        return supabase.inviteCollaborator({
                id,
                board_id: boardId,
                to_email: email,
                permission_id: permissionId
        });
}

export async function removeCollaboratorDB(accId: string) {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("board title or board id is not set");

        supabase.kickCollaborator(boardId, accId);
}

export async function removeInvitationDB(email: string) {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("board title or board id is not set");

        supabase.removeInvitation(boardId, email);
}

export async function changeCollaboratorAccessDB(collaboratorAccId: string, newPermissionId: number) {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("board title or board id is not set");

        supabase.changeCollaboratorAccess(boardId, collaboratorAccId, newPermissionId);
}
