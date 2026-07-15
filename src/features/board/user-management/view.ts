import DOMPurify from 'dompurify';
import { setStateClass } from "@/core/utils/dom";
import { HTML } from "./html";
import type { BoardCollaborator } from "./types";
import { PermissionId } from "@/core/types/auth";
import { getAccount } from "@/core/utils/utils";
import { BoardStore } from '../board-state';

export function setDiv({ addUser }: { addUser: boolean }) {
        const show = addUser ? HTML.addUsers.div : HTML.manageUsers.div;
        const hide = addUser ? HTML.manageUsers.div : HTML.addUsers.div;
        setStateClass([show], [hide], "shown");

        HTML.addUsers.btn.checked = addUser;
        HTML.manageUsers.btn.checked = !addUser;
}

export function disableInputs() {
        const inps = HTML.addUsers.div.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
        inps.forEach(inp => inp.disabled = true);
}

export async function createCollaboratorDiv(c: BoardCollaborator): Promise<HTMLDivElement> {
        const div = Object.assign(document.createElement("div"), { className: "collaborator-div" });
        div.dataset.id = c.id

        const role = PermissionId[c.permission_id];

        const acc = await getAccount();
        if (!acc) throw new Error(`Account was not set`);

        const isUser = c.account_id == acc.id;

        div.innerHTML = DOMPurify.sanitize(`
                <img class="collab-avatar" crossorigin="anonymous" referrerpolicy="no-referrer" src="${c.avatar_url}" alt="${c.name}" />
                <div class="collab-info">
                    <span class="collab-name">${c.name} ${isUser ? '(You)' : ""}</span>
                    <span class="collab-email">${c.email}</span>
                </div>
                <div class="collab-meta">
                    <span class="collab-permission collab-permission--${role.toLowerCase()}">${role}</span>
                    <span class="collab-date">${new Date(c.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <button class="collab-remove" aria-label="Remove collaborator" ${[PermissionId.Owner, PermissionId.Admin].includes(BoardStore.permissionId!) ? "" : "disabled"}>
                    <i class="ti ti-trash"></i>
                </button>
            `, { ADD_ATTR: ["referrerpolicy"] });

        return div;
}
