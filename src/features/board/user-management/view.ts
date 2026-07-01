import { setStateClass } from "@/core/utils/dom";
import { HTML } from "./html";
import type { BoardCollaborator } from "./types";
import { PermissionId } from "@/core/types/auth";
import { getAccount } from "@/core/utils/utils";

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
        const role = PermissionId[c.permission_id];

        const acc = await getAccount();
        if (!acc) throw new Error(`Account was not set`);

        const isUser = c.account_id == acc.id;

        div.innerHTML = `
        <img class="collab-avatar" crossorigin="anonymous" referrerpolicy="no-referrer" />
        <div class="collab-info">
            <span class="collab-name"></span>
            <span class="collab-email"></span>
        </div>
        <div class="collab-meta">
            <span class="collab-permission collab-permission--${role.toLowerCase()}">${role}</span>
            <span class="collab-date">${new Date(c.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <button class="collab-remove" aria-label="Remove collaborator" ${c.permission_id != PermissionId.Admin ? "" : "disabled"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
        </button>
    `;
        const avatar = div.querySelector(".collab-avatar") as HTMLImageElement;
        avatar.src = c.avatar_url;
        avatar.alt = c.name;

        const name = div.querySelector(".collab-name") as HTMLSpanElement;
        name.textContent = `${c.name} ${isUser ? '(You)' : ""}`;
        const email = div.querySelector(".collab-email") as HTMLSpanElement;
        email.textContent = c.email;

        return div;
}
