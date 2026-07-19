import DOMPurify from 'dompurify';
import { setStateClass } from "@/core/utils/dom";
import { HTML } from "./html";
import type { BoardCollaborator } from "./types";
import { PermissionId } from "@/core/types/auth";
import { BoardStore } from '../board-state';
import { supabase } from '@/core/api/supabase';

export function setDiv({ addUser }: { addUser: boolean }) {
        const show = addUser ? HTML.addUsers.div : HTML.manageUsers.div;
        const hide = addUser ? HTML.manageUsers.div : HTML.addUsers.div;
        setStateClass([show], [hide], "shown");

        HTML.addUsers.btn.checked = addUser;
        HTML.manageUsers.btn.checked = !addUser;
}

export function disableInputs(permission: PermissionId | null) {
        if (permission == PermissionId.Owner) return;

        const inps = HTML.addUsers.div.querySelectorAll("input") as NodeListOf<HTMLInputElement>;

        if (permission == PermissionId.Admin) {
                const adminInput = inps.item(inps.length - 1);
                adminInput.disabled = true;
        }
        else {
                inps.forEach(inp => inp.disabled = true);
        }
}

export function triggerRoleChangeDropdown(element: HTMLElement) {
        const accPermission = BoardStore.permissionId;
        const collabPermission = element.dataset.permission;
        if (!accPermission || accPermission < PermissionId.Admin || Number(collabPermission) >= accPermission) return;

        if (accPermission == PermissionId.Admin) {
                const ownerDiv = HTML.changeRoleDropdown.dialog.querySelector(`[data-permission-id="5"]`) as HTMLDivElement;
                ownerDiv.style.display = "none";
        }

        const options = HTML.changeRoleDropdown.dialog.querySelectorAll("[data-permission-id]") as NodeListOf<HTMLDivElement>;

        for (const option of options) {
                if (option.dataset.permission == collabPermission) {
                        option.classList.add("active");
                }
                else {
                        option.classList.remove("active");
                }
        }

        const rect = element.getBoundingClientRect();

        const collabDiv = element.closest(".collaborator-div") as HTMLElement;
        HTML.changeRoleDropdown.dialog.dataset.accountId = collabDiv.dataset.id;

        HTML.changeRoleDropdown.dialog.style.left = `${rect.left}px`;
        HTML.changeRoleDropdown.dialog.style.top = `${rect.bottom + 2}px`;

        HTML.changeRoleDropdown.dialog.showModal();
}

export async function createCollaboratorDiv(c: BoardCollaborator): Promise<HTMLDivElement> {
        const div = Object.assign(document.createElement("div"), { className: "collaborator-div" });
        div.dataset.id = c.account_id;

        const role = PermissionId[c.permission_id];

        const acc = await supabase.getAccount();
        if (!acc) throw new Error(`Account was not set`);

        const isMe = c.account_id == acc.id;

        const userPerm = BoardStore.permissionId;
        const canChangePerm = userPerm == PermissionId.Owner || (userPerm == PermissionId.Admin && c.permission_id < PermissionId.Admin);

        div.innerHTML = DOMPurify.sanitize(`
                <img class="collab-avatar" crossorigin="anonymous" referrerpolicy="no-referrer" src="${c.avatar_url}" alt="${c.name}" />
                <div class="collab-info">
                    <span class="collab-name">${c.name} ${isMe ? '(You)' : ""}</span>
                    <span class="collab-email">${c.email}</span>
                </div>
                <div class="collab-meta">
                    <span class="collab-permission collab-permission--${role.toLowerCase()}" data-permission="${c.permission_id}">
                        <p>${role}</p>
                        ${!isMe && canChangePerm ? `<i class="ti ti-chevron-down"></i>` : ""}
                    </span>
                    <span class="collab-date">${new Date(c.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                ${!isMe && canChangePerm ? `
                <button class="collab-remove" aria-label="Remove collaborator" ${[PermissionId.Owner, PermissionId.Admin].includes(BoardStore.permissionId!) ? "" : "disabled"}>
                    <i class="ti ti-trash"></i>
                </button>`: ""}
            `, { ADD_ATTR: ["referrerpolicy"] });

        return div;
}
