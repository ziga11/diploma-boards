import { showToast } from "@/core/utils/dom";
import { HTML } from "./html";
import { sendCollabInvitation, isValidEmail, removeCollaborator, fetchCollaborators } from "./logic";
import { createCollaboratorDiv, setDiv } from "./view";
import { BoardStore } from "../board-state";
import { PermissionId } from "@/core/types/auth";
import { userManagementEvents } from "./custom-events";

export function initUserManagementEvents() {
        if (BoardStore.isInitialized) return;

        HTML.addUsers.finishBtn.addEventListener("click", async (_) => {
                const mail = HTML.addUsers.email.value;
                const selPermission = HTML.addUsers.div.querySelector(".permission-card input:checked") as HTMLInputElement | null;

                if (!isValidEmail(mail)) {
                        showToast(`Invalid email`, "error");
                        return;
                }
                if (!selPermission) {
                        console.log("showing toast");

                        showToast(`Permission is not specified`, "error");
                        return;
                }

                const id = crypto.randomUUID();

                sendCollabInvitation(id, mail, Number(selPermission.value))
                        .then(_ => {
                                HTML.addUsers.email.value = "";
                                selPermission.checked = false;

                                showToast(`board collaboration request sent to: ${mail}`, "success");
                        })
                        .catch(err => showToast(`Failed to send user invitation ${err}`, "error"));

        });

        HTML.manageUsers.userContainer.addEventListener("click", (e: MouseEvent) => {
                const htmlElem = e.target as HTMLElement;
                const accId = htmlElem.dataset.accountId;

                if (htmlElem.className != "collab-remove" || !accId) return;

                const permissionId = BoardStore.permissionId;
                if (permissionId != PermissionId.Admin) {
                        showToast("You can only remove a collaborator if you're an Admin", "error");
                        return;
                }

                removeCollaborator(accId)
                        .then(_ => htmlElem.remove())
                        .catch(err => showToast(`Failed to remove the collaborator ${err}`, "error"));
        });

        HTML.addUsers.btn.addEventListener("click", (_) => setDiv({ addUser: true }));

        HTML.manageUsers.btn.addEventListener("click", (_) => setDiv({ addUser: false }));

        window.addEventListener(userManagementEvents.showModal.type, async () => {
                setDiv({ addUser: true });
                HTML.modal.showModal();

                const collaborators = await Promise.all(Array.from(BoardStore.collaborators.values()).map(async c => (await createCollaboratorDiv(c))));

                HTML.manageUsers.userContainer.replaceChildren(...collaborators)
        });
}
