import { HTML } from "./html";
import { PermissionId } from "@/core/types/auth";

export function toggleRecoverBtn(show: boolean): void {
        HTML.btns.recover.classList.toggle("shown", show);
}

export function toggleAddUserBtn(show: boolean): void {
        HTML.btns.addUser.classList.toggle("shown", show);
}

export function toggleBoardActionBtns({ isOwner, isDeleted }: { isOwner: boolean; isDeleted: boolean }): void {
        HTML.btns.leaveBoardModal.classList.toggle("shown", !isDeleted && !isOwner);
        HTML.btns.deleteBoardModal.classList.toggle("shown", !isDeleted && isOwner);
}

export function togglePermissionBasedBtns({ permission, isDeleted }: { permission: PermissionId; isDeleted: boolean }): void {
        const active = !isDeleted;
        HTML.btns.newEntry.classList.toggle("shown", active && permission >= PermissionId.Editor);
        HTML.btns.automations.classList.toggle("shown", active && permission >= PermissionId.Manager);
        HTML.btns.history.classList.toggle("shown", active && permission >= PermissionId.Manager);
}

export function hideAllButtons() {
        toggleRecoverBtn(false);
        toggleAddUserBtn(false);
        HTML.btns.newEntry.classList.remove("shown")
        HTML.btns.automations.classList.remove("shown")
        HTML.btns.history.classList.remove("shown");
        HTML.btns.leaveBoardModal.classList.remove("shown");
        HTML.btns.deleteBoardModal.classList.remove("shown");
}

export function setBoardSettings(name: string, color: string) {
        HTML.toolbarDiv.style.borderLeftColor = color;
        HTML.title.text.innerText = name;
        HTML.title.text.dataset.dbValue = name;
}
