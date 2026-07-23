import { PermissionId } from "@/core/types/auth";
import { BoardState } from "../board-state";
import { HTML } from "./html";

export function applyPermissionRestrictions() {
        const permission = BoardState.permissionId;
        const isOwner = permission == PermissionId.Owner;

        const isDeleted = BoardState.isDeleted;

        HTML.btns.recover.classList.toggle("shown", isOwner && isDeleted);

        if (!permission) throw new Error(`Permissions not set`);

        HTML.btns.addUser.classList.toggle("shown", !isDeleted);

        HTML.btns.leaveBoardModal.classList.toggle("shown", !isDeleted && !isOwner);
        HTML.btns.deleteBoardModal.classList.toggle("shown", !isDeleted && isOwner);
        HTML.btns.newEntry.classList.toggle("shown", !isDeleted && permission >= PermissionId.Editor);
        HTML.btns.automations.classList.toggle("shown", !isDeleted && permission >= PermissionId.Manager);
        HTML.btns.history.classList.toggle("shown", !isDeleted && permission >= PermissionId.Manager);
}
