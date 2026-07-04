import { supabase } from "@/core/api/supabase";
import { BoardStore } from "../board-state";
import type { InsertNotification } from "./types";
import { getAccount } from "@/core/utils/utils";

export function isValidEmail(email: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email)
}

export async function sendCollabInvitation(id: string, email: string, permission: number) {
        const acc = await getAccount();
        const boardId = BoardStore.boardId;
        const boardTitle = BoardStore.boardTitle;

        if (!acc) throw new Error("account is not set");
        if (!boardId || !boardTitle) throw new Error("board title or board id is not set");

        await supabase.insertNotification({
                id,
                from_acc_id: acc?.id,
                to_acc_email: email,
                message: `I'm inviting you to join the board ${boardTitle}`,
                board_id: boardId,
                permission_id: permission,
                state: "pending",
                type: "invitation"
        } as InsertNotification);
}

export async function removeCollaborator(collaboratorAccId: string) {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("board title or board id is not set");

        supabase.kickCollaborator(collaboratorAccId, boardId);
}

