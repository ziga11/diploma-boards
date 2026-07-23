import { showToast } from "@/core/utils/dom";
import { HTML } from "./html";
import { sendCollabInvitation, isValidEmail, removeCollaborator, changeCollaboratorAccess, removeInvitation } from "./logic";
import { createCollaboratorDiv, createInviteDiv, setDiv, triggerRoleChangeDropdown } from "./view";
import { BoardState } from "../board-state";
import { PermissionId } from "@/core/types/auth";
import { userManagementEvents } from "./custom-events";

export function initUserManagementEvents() {
        if (BoardState.isInitialized) return;

        HTML.addUsers.finishBtn.addEventListener("click", async (_) => {
                const mail = HTML.addUsers.email.value;
                const selPermission = HTML.addUsers.div.querySelector(".permission-card input:checked") as HTMLInputElement | null;

                if (!isValidEmail(mail)) {
                        showToast(`Invalid email`, "error");
                        return;
                }
                if (!selPermission) {
                        showToast(`Permission is not specified`, "error");
                        return;
                }

                const id = crypto.randomUUID();

                sendCollabInvitation(id, mail, Number(selPermission.value))
                        .then(invCollaborator => {
                                HTML.addUsers.email.value = "";
                                selPermission.checked = false;

                                window.dispatchEvent(userManagementEvents.addInvitedCollaborator(invCollaborator));

                                showToast(`board collaboration request sent to: ${mail}`, "success");
                        })
                        .catch(err => showToast(err, "error"));
        });

        HTML.manageUsers.div.addEventListener("click", (e: MouseEvent) => {
                const htmlElem = e.target as HTMLElement;

                if (htmlElem.className == "collab-remove") {
                        const collabDiv = htmlElem.closest(".collaborator-div") as HTMLDivElement;
                        const isInvited = collabDiv.classList[1] === "collaborator-div--pending";

                        if (isInvited) {
                                const email = collabDiv.dataset.toEmail!;

                                BoardState.removeInvitedCollaborator(email);
                                removeInvitation(email)
                                        .then(_ => collabDiv.remove())
                                        .catch(err => showToast(`Failed to remove the invitation ${err}`, "error"));
                        }
                        else {
                                const accId = htmlElem.dataset.accountId;
                                removeCollaborator(accId!)
                                        .then(_ => collabDiv.remove())
                                        .catch(err => showToast(`Failed to remove the collaborator ${err}`, "error"));
                        }
                }
                else if (htmlElem.classList[0] == "collab-permission") {
                        triggerRoleChangeDropdown(htmlElem);
                }
                else if (htmlElem.id === "added-users") {
                        htmlElem.classList.add("active");
                        (htmlElem.nextElementSibling as HTMLElement).classList.remove("active");

                        HTML.manageUsers.title.innerText = "Added Users";
                        HTML.manageUsers.subtitle.innerText = "These people have access to view the board and more depending on their role";
                }
                else if (htmlElem.id === "invited-users") {
                        htmlElem.classList.add("active");
                        (htmlElem.previousElementSibling as HTMLElement).classList.remove("active");

                        HTML.manageUsers.title.innerText = "Invited Users";
                        HTML.manageUsers.subtitle.innerText = "These people have been invited and will receive the designated role when accepted";
                }
        });

        HTML.changeRoleDropdown.dialog.addEventListener("click", (e: Event) => {
                const elem = e.target as HTMLElement;
                if (elem.className != "permission-dropdown-option") return;

                const otherAccId = HTML.changeRoleDropdown.dialog.dataset.accountId;
                const permissionId = elem.dataset.permissionId;

                if (!otherAccId || !permissionId) return;

                changeCollaboratorAccess(otherAccId, Number(permissionId));
                BoardState.updateCollaboratorPermission(otherAccId, Number(permissionId));
                HTML.changeRoleDropdown.dialog.close();

                window.dispatchEvent(userManagementEvents.loadCollaborators());
        })

        HTML.addUsers.btn.addEventListener("click", (_) => setDiv({ addUser: true }));

        HTML.manageUsers.btn.addEventListener("click", (_) => setDiv({ addUser: false }));

        window.addEventListener(userManagementEvents.showModal.type, async () => {
                setDiv({ addUser: true });
                HTML.modal.showModal();
                if (BoardState.permissionId! < PermissionId.Admin) {
                        HTML.addUsers.div.classList.add("disabled");
                }
                else if (BoardState.permissionId == PermissionId.Admin) {
                        const adminPermCard = HTML.addUsers.div.querySelector(`[data-permission-type="Admin"]`) as HTMLDivElement;
                        adminPermCard.classList.add("disabled");
                }

                window.dispatchEvent(userManagementEvents.loadCollaborators());
        });

        window.addEventListener(userManagementEvents.addCollaborator.type, async (e: Event) => {
                const collaborator = (e as ReturnType<typeof userManagementEvents.addCollaborator>).detail;

                const collaboratorElem = await createCollaboratorDiv(collaborator);

                HTML.manageUsers.addedUsersContainer.appendChild(collaboratorElem);
        });

        window.addEventListener(userManagementEvents.removeCollaborator.type, async (e: Event) => {
                const id = (e as ReturnType<typeof userManagementEvents.removeCollaborator>).detail;

                const collaboratorElem = HTML.manageUsers.userContainer.querySelector(`.collaborator-div[data-id="${id}"]`);

                collaboratorElem?.remove();
        });

        window.addEventListener(userManagementEvents.addInvitedCollaborator.type, async (e: Event) => {
                const collaborator = (e as ReturnType<typeof userManagementEvents.addInvitedCollaborator>).detail;

                const collaboratorElem = createInviteDiv(collaborator);

                HTML.manageUsers.invitedUsersContainer.appendChild(collaboratorElem);
        });

        window.addEventListener(userManagementEvents.removeInvitedCollaborator.type, async (e: Event) => {
                const inv = (e as ReturnType<typeof userManagementEvents.removeInvitedCollaborator>).detail;

                const collaboratorElem = HTML.manageUsers.userContainer.querySelector(`.collaborator-div--pending[data-to-email="${inv.to_email}"]`);

                collaboratorElem?.remove();
        });

        window.addEventListener(userManagementEvents.loadCollaborators.type, async () => {
                const added = await Promise.all(Array.from(BoardState.collaborators.values()).map(async c => (await createCollaboratorDiv(c))));
                const invited = BoardState.invitedCollaborators.map(createInviteDiv);

                HTML.manageUsers.addedUsersContainer.replaceChildren(...added)
                HTML.manageUsers.invitedUsersContainer.replaceChildren(...invited)
        });
}
