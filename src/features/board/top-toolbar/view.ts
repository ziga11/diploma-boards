import { PermissionId } from "@/core/types/auth";
import { BoardStore } from "../board-state";
import { HTML } from "./html";

export function applyPermissionRestrictions() {
        const permission = BoardStore.permissionId;
        const isOwner = permission == PermissionId.Owner;

        if (BoardStore.isDeleted) {
                HTML.btns.recover.classList.toggle("shown", isOwner);
                return;
        }

        if (!permission) throw new Error(`Permissions not set`);

        HTML.btns.leaveBoardModal.classList.toggle("shown", !isOwner);
        HTML.btns.deleteBoardModal.classList.toggle("shown", isOwner);

        HTML.btns.newEntry.classList.toggle("shown", permission >= PermissionId.Editor);

        HTML.btns.automations.classList.toggle("shown", permission >= PermissionId.Manager);
        HTML.btns.history.classList.toggle("shown", permission >= PermissionId.Manager);
}
