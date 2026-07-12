import { PermissionId } from "@/core/types/auth";
import { BoardStore } from "../board-state";
import { HTML } from "./html";

export function applyPermissionRestrictions() {
        const permission = BoardStore.permissionId;
        const isOwner = permission == PermissionId.Owner;

        HTML.btns.recover.classList.toggle("shown", BoardStore.isDeleted && isOwner);

        if (!permission) throw new Error(`Permissions not set`);

        HTML.btns.leaveBoardModal.classList.toggle("shown", !isOwner && !BoardStore.isDeleted);
        HTML.btns.deleteBoardModal.classList.toggle("shown", isOwner && !BoardStore.isDeleted);

        HTML.btns.newEntry.classList.toggle("shown", permission >= PermissionId.Editor && !BoardStore.isDeleted);

        HTML.btns.automations.classList.toggle("shown", permission >= PermissionId.Manager && !BoardStore.isDeleted);

        HTML.btns.history.classList.toggle("shown", permission >= PermissionId.Admin && !BoardStore.isDeleted);
        HTML.btns.addUser.classList.toggle("shown", permission >= PermissionId.Admin && !BoardStore.isDeleted);
}
