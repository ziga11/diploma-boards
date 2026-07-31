import { supabase } from "@/core/api/supabase";
import { MasterRegistry } from "@/features/board/master-registry";
import { workspaceToken } from "@/features/board/workspace/registry";
import { PermissionId } from "@/core/types/auth";
import { toggleAddUserBtn, toggleBoardActionBtns, togglePermissionBasedBtns, toggleRecoverBtn } from "./ui";
import { workspaceEvents } from "@/features/board/workspace/custom-events";
import { dashboardEvents } from "@/features/dashboard/workspace/custom-events";
import { showToast } from "@/core/utils/dom";

export async function recoverBoard() {
        const id = MasterRegistry.get(workspaceToken).getBoardId();
        if (!id) throw new Error("Board ID not set");

        MasterRegistry.get(workspaceToken).setDeleted(false);
        try {
                supabase.recoverBoard(id);
                applyPermissionRestrictions();
                window.dispatchEvent(workspaceEvents.recoverBoard());
                window.dispatchEvent(dashboardEvents.moveBoard({ id, group: "owned" }));
        }
        catch (err) {
                console.error("failed to recover board", err);

                showToast("Failed to recover board");
        }
}

export function applyPermissionRestrictions(): void {
        const board = MasterRegistry.get(workspaceToken).getBoard();
        const permission = board?.permission_id;

        if (!permission) throw new Error("Permissions not set");

        const isDeleted = Boolean(board?.deleted);
        const isOwner = permission === PermissionId.Owner;

        toggleRecoverBtn(isOwner && isDeleted);
        toggleAddUserBtn(!isDeleted);
        toggleBoardActionBtns({ isOwner, isDeleted });
        togglePermissionBasedBtns({ permission, isDeleted });
}
