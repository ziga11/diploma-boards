import { supabase } from "@/core/api/supabase";
import { BoardState } from "../board-state";

export function isValidEmail(email: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email)
}

export async function sendCollabInvitation(id: string, email: string, permission: number) {
        return await supabase.inviteCollaborator({
                id,
                to_email: email,
                permission_id: permission,
        });
}

export async function removeCollaborator(accId: string) {
        const boardId = BoardState.boardId;
        if (!boardId) throw new Error("board title or board id is not set");

        supabase.kickCollaborator(accId);
}

export async function removeInvitation(email: string) {
        const boardId = BoardState.boardId;
        if (!boardId) throw new Error("board title or board id is not set");

        supabase.removeInvitation(email);
}

export async function changeCollaboratorAccess(collaboratorAccId: string, newPermissionId: number) {
        supabase.changeCollaboratorAccess(collaboratorAccId, newPermissionId);
}
