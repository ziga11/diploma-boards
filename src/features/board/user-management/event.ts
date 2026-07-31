import { HTML } from "./html";
import { addCollaborator, addInvitedCollaborator, onUserViewBtnPress, removeCollaboratorElemById, removeInvitedCollaboratorByEmail, setDiv } from "./view";
import { userManagementEvents } from "./custom-events";
import { UsersState } from "./state";
import { deleteCollaborator, triggerUserManagementModal, loadCollaborators, onAddUserBtnPress, onRoleChange, triggerRoleChangeDropdown, prepareCollaboratorViewModels } from "./logic/operations";

export function initUserManagementEvents() {
        if (UsersState.isInitialized()) return;

        HTML.addUsers.finishBtn.addEventListener("click", () => onAddUserBtnPress());

        HTML.modal.addEventListener("click", (e: MouseEvent) => {
                const htmlElem = e.target as HTMLElement;

                if (htmlElem.className == "collab-remove") {
                        deleteCollaborator(htmlElem);
                }
                else if (htmlElem.classList[0] == "collab-permission") {
                        triggerRoleChangeDropdown(htmlElem);
                }
                else if (htmlElem.id === "added-users" || htmlElem.id === "invited-users") {
                        onUserViewBtnPress(htmlElem.id === "added-users");
                }
                else if (htmlElem == HTML.addUsers.btn || htmlElem == HTML.manageUsers.btn) {
                        setDiv({ addUser: htmlElem == HTML.addUsers.btn });
                }
        });

        HTML.changeRoleDropdown.dialog.addEventListener("click", (e: MouseEvent) => {
                if ((e.target as HTMLElement).className == "permission-dropdown-option") {
                        onRoleChange(e.target as HTMLElement);
                }
        })

        window.addEventListener(userManagementEvents.showModal.type, async () => {
                triggerUserManagementModal();
        });

        window.addEventListener(userManagementEvents.addCollaborator.type, async (e: Event) => {
                const collaborator = (e as ReturnType<typeof userManagementEvents.addCollaborator>).detail;

                UsersState.addCollaborator(collaborator);
                const viewModels = await prepareCollaboratorViewModels([collaborator]);
                addCollaborator(viewModels[0]);
        });

        window.addEventListener(userManagementEvents.removeCollaborator.type, async (e: Event) => {
                const id = (e as ReturnType<typeof userManagementEvents.removeCollaborator>).detail;

                UsersState.removeCollaborator(id);
                removeCollaboratorElemById(id);
        });

        window.addEventListener(userManagementEvents.addInvitedCollaborator.type, async (e: Event) => {
                const collaborator = (e as ReturnType<typeof userManagementEvents.addInvitedCollaborator>).detail;

                UsersState.addInvitedCollaborator(collaborator);
                addInvitedCollaborator(collaborator);
        });

        window.addEventListener(userManagementEvents.removeInvitedCollaborator.type, async (e: Event) => {
                const { email } = (e as ReturnType<typeof userManagementEvents.removeInvitedCollaborator>).detail;

                UsersState.removeInvitedCollaborator(email);
                removeInvitedCollaboratorByEmail(email);
        });

        window.addEventListener(userManagementEvents.loadCollaborators.type, async () => loadCollaborators());
}
