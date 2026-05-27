import { Globals } from "../../../globals";
import type { InsertNotification } from "../../../types";
import { getAccount, showToast } from "../../../utils";
import { addUserModal, boardElements, topToolbar } from "../../types";
import { isValidEmail } from "../../utils/other";
import { showAddUserSection, showManageUsersSection } from "../../utils/toolbar";

addUserModal.addUsers.finishBtn.addEventListener("click", async (_) => {
        const mailInp = addUserModal.addUsers.email;
        const mail = mailInp.value;
        const title = topToolbar.left.boardTitle.innerText;
        const selPermission = addUserModal.addUsers.div.querySelector(".permission-card input:checked") as HTMLInputElement | null;

        if (!isValidEmail(mail)) {
                showToast(`Invalid email`, boardElements.toastContainer, "error");
                return;
        }
        if (!selPermission) {
                showToast(`Permission is not specified`, boardElements.toastContainer, "error");
                return;
        }

        const permission = Number(selPermission.value);

        try {
                const acc = await getAccount();
                await Globals.supabase.insertNotification({
                        from_acc_id: acc?.id,
                        to_acc_email: mail,
                        message: `I'm inviting you to join the board ${title}`,
                        board_id: Globals.board?.id,
                        permission_id: permission,
                        state: "pending",
                        type: "invitation"
                } as InsertNotification);

                mailInp.value = "";
                selPermission.checked = false;
                showToast(`The invitation to join the board has been sent to ${mail}`, boardElements.toastContainer, "success");
        }
        catch (err) {
                showToast(`Failed to send the invitation: ${err}`, boardElements.toastContainer, "error");
        }
});

addUserModal.modal.addEventListener("show.bs.modal", (_) => showAddUserSection())
addUserModal.addUsers.btn.addEventListener("click", (_) => showAddUserSection());
addUserModal.manageUsers.btn.addEventListener("click", (_) => showManageUsersSection());
