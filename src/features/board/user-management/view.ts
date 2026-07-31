import DOMPurify from 'dompurify';
import { PermissionId } from "@/core/types/auth";
import { setStateClass } from "@/core/utils/dom";
import { HTML } from "./html";
import type { InvitedCollaborator } from "./types";
import type { CollaboratorViewModel } from './render-types';

export function setDiv({ addUser }: { addUser: boolean }) {
        const show = addUser ? HTML.addUsers.div : HTML.manageUsers.div;
        const hide = addUser ? HTML.manageUsers.div : HTML.addUsers.div;
        setStateClass([show], [hide], "shown");

        HTML.addUsers.btn.checked = addUser;
        HTML.manageUsers.btn.checked = !addUser;
}

export function clearAddUserInputs() {
        HTML.addUsers.email.value = "";

        const permCards = HTML.addUsers.div.querySelectorAll(".permission-card") as NodeListOf<HTMLInputElement>;
        permCards.forEach(card => card.checked = false);
}

export function onUserViewBtnPress(added: boolean) {
        HTML.manageUsers.addedUsersBtn.classList.toggle("active", added);
        HTML.manageUsers.invitedUsersBtn.classList.toggle("active", !added);

        HTML.manageUsers.title.innerText = added ? "Added Users" : "Invited Users";
        HTML.manageUsers.subtitle.innerText = added ?
                "These people have access to view the board and more depending on their role" :
                "These people have been invited and will receive the designated role when accepted";
}

export function closeRoleChangeDropdown() {
        HTML.changeRoleDropdown.dialog.close();
}

export function hideAdminRoleInDropdown() {
        const ownerDiv = HTML.changeRoleDropdown.dialog.querySelector(`[data-permission-id="5"]`) as HTMLDivElement;
        ownerDiv.style.display = "none";
}

export function setActiveRoleInDropdown(permissionId: PermissionId) {
        const options = HTML.changeRoleDropdown.dialog.querySelectorAll("[data-permission-id]") as NodeListOf<HTMLDivElement>;
        for (const option of options) {
                if (option.dataset.permissionId == `${permissionId}`) {
                        option.classList.add("active");
                }
                else {
                        option.classList.remove("active");
                }
        }
}

export function openRoleChangeDropdown(left: number, top: number) {
        HTML.changeRoleDropdown.dialog.style.left = `${left}px`;
        HTML.changeRoleDropdown.dialog.style.top = `${top}px`;

        HTML.changeRoleDropdown.dialog.showModal();
}

export function createCollaboratorDiv(vm: CollaboratorViewModel): HTMLDivElement {
        const div = Object.assign(document.createElement("div"), { className: "collaborator-div" });
        div.dataset.accountId = vm.id;

        div.innerHTML = DOMPurify.sanitize(`
        <img class="collab-avatar" crossorigin="anonymous" referrerpolicy="no-referrer" src="${vm.avatarUrl}" alt="${vm.name}" />
        <div class="collab-info">
            <span class="collab-name">${vm.name} ${vm.isMe ? '(You)' : ""}</span>
            <span class="collab-email">${vm.email}</span>
        </div>
        <div class="collab-meta">
            <span class="collab-permission collab-permission--${vm.role.toLowerCase()}" data-permission-id="${vm.permissionId}">
                <p>${vm.role}</p>
                ${vm.canChangePerm ? `<i class="ti ti-chevron-down"></i>` : ""}
            </span>
            <span class="collab-date">${vm.formattedDate}</span>
        </div>
        ${vm.canRemove ? `
        <button class="collab-remove" aria-label="Remove collaborator">
            <i class="ti ti-trash"></i>
        </button>` : ""}
    `, { ADD_ATTR: ["referrerpolicy"] });

        return div;
}

export function setInvitedCollaborators(invs: InvitedCollaborator[]) {
        const collaboratorElem = invs.map(createInviteDiv);

        HTML.manageUsers.invitedUsersContainer.replaceChildren(...collaboratorElem);
}

export function addInvitedCollaborator(inv: InvitedCollaborator) {
        const collaboratorElem = createInviteDiv(inv);

        HTML.manageUsers.invitedUsersContainer.appendChild(collaboratorElem);
}

export function openUserManagementModal() {
        HTML.modal.showModal();
}

export function disableAllPermissionCards() {
        HTML.addUsers.div.classList.add("disabled");
}

export function disableAdminPermissionCard() {
        const adminPermCard = HTML.addUsers.div.querySelector(`[data-permission-type="Admin"]`) as HTMLDivElement;
        adminPermCard.classList.add("disabled");
}

export function addCollaborator(viewModel: CollaboratorViewModel) {
        const collaboratorElem = createCollaboratorDiv(viewModel);
        HTML.manageUsers.addedUsersContainer.appendChild(collaboratorElem);
}

export function setCollaborators(viewModels: CollaboratorViewModel[]) {
        const collaboratorElems = viewModels.map(createCollaboratorDiv);
        HTML.manageUsers.addedUsersContainer.replaceChildren(...collaboratorElems);
}

export function removeCollaboratorElemById(id: string) {
        const collaboratorElem = HTML.manageUsers.userContainer.querySelector(`.collaborator-div[data-account-id="${id}"]`);

        collaboratorElem?.remove();
}

export function removeInvitedCollaboratorByEmail(email: string) {
        const collaboratorElem = HTML.manageUsers.userContainer.querySelector(`.collaborator-div--pending[data-to-email="${email}"]`);

        collaboratorElem?.remove();
}

export function createInviteDiv(inv: InvitedCollaborator): HTMLDivElement {
        const div = Object.assign(document.createElement("div"), { className: "collaborator-div collaborator-div--pending" });
        div.dataset.toEmail = inv.to_email;

        const roleName = PermissionId[inv.permission_id];
        div.innerHTML = DOMPurify.sanitize(`
        <div class="collab-avatar collab-avatar--invite">
            <i class="ti ti-mail"></i>
        </div>
        <div class="collab-info">
            <span class="collab-name">${inv.to_email}</span>
            <span class="collab-email">Invited by ${inv.invited_by.name}</span>
        </div>
        <div class="collab-meta">
            <div class="collab-pending-badges">
                <span class="collab-permission collab-permission--pending">
                    <p>Invited</p>
                </span>
                <span class="collab-permission collab-permission--${roleName.toLowerCase()}">
                    <p>${roleName}</p>
                </span>
            </div>
            <span class="collab-date">${new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <button class="collab-remove" aria-label="Cancel invite">
            <i class="ti ti-trash"></i>
        </button>
    `);
        return div;
}
