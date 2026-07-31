import { showToast } from "@/core/utils/dom";
import { HTML } from "../html";
import { PermissionId } from "@/core/types/auth";
import { MasterRegistry } from "@/features/board/master-registry";
import { workspaceToken } from "@/features/board/workspace/registry";
import { changeCollaboratorAccessDB, removeCollaboratorDB, removeInvitationDB, inviteCollaboratorDB } from "./api";
import { userManagementEvents } from "../custom-events";
import { clearAddUserInputs, closeRoleChangeDropdown, disableAdminPermissionCard, disableAllPermissionCards, hideAdminRoleInDropdown, openRoleChangeDropdown, openUserManagementModal, setActiveRoleInDropdown, setCollaborators, setDiv, setInvitedCollaborators } from "../view";
import { UsersState } from "../state";
import { usersToken } from "../registry";
import type { Collaborator } from "../types";
import type { CollaboratorViewModel } from "../render-types";
import { supabase } from "@/core/api/supabase";

export function isValidEmail(email: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email)
}

export async function onAddUserBtnPress() {
        const email = HTML.addUsers.email.value;
        const permissionCard = HTML.addUsers.div.querySelector(".permission-card input:checked") as HTMLInputElement | null;

        if (!isValidEmail(email)) {
                showToast(`Invalid email`, "error");
                return;
        }
        if (!permissionCard) {
                showToast(`Permission is not specified`, "error");
                return;
        }

        const id = crypto.randomUUID();
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("board id not set");

        try {
                const invCollaborator = await inviteCollaboratorDB(id, boardId, email, Number(permissionCard.value));
                window.dispatchEvent(userManagementEvents.addInvitedCollaborator(invCollaborator));
                clearAddUserInputs();

                showToast(`board collaboration request sent to: ${email}`, "success");
        }
        catch (err: any) {
                showToast(err, "error")
        }
}

export async function deleteCollaborator(removeBtn: HTMLElement) {
        const collabDiv = removeBtn.closest(".collaborator-div") as HTMLDivElement;
        const isInvited = collabDiv.classList[1] === "collaborator-div--pending";

        if (isInvited) {
                const email = collabDiv.dataset.toEmail!;

                UsersState.removeInvitedCollaborator(email);
                removeInvitationDB(email)
                        .then(_ => collabDiv.remove())
                        .catch(err => showToast(`Failed to remove the invitation ${err}`, "error"));
        }
        else {
                const accId = collabDiv.dataset.accountId;


                UsersState.removeCollaborator(accId!);
                removeCollaboratorDB(accId!)
                        .then(_ => collabDiv.remove())
                        .catch(err => showToast(`Failed to remove the collaborator ${err}`, "error"));
        }
}

export function onRoleChange(elem: HTMLElement) {
        const otherAccId = HTML.changeRoleDropdown.dialog.dataset.accountId;
        const permissionId = elem.dataset.permissionId;

        if (!otherAccId || !permissionId) return;

        changeCollaboratorAccessDB(otherAccId, Number(permissionId));

        MasterRegistry.get(usersToken).updateCollaboratorPermission(otherAccId, Number(permissionId));
        closeRoleChangeDropdown();

        loadCollaborators();
}

export async function triggerUserManagementModal() {
        setDiv({ addUser: true });
        openUserManagementModal();

        const permissionId = MasterRegistry.get(workspaceToken).getBoard()?.permission_id!;

        if (permissionId < PermissionId.Admin) {
                disableAllPermissionCards();
        }
        else if (permissionId == PermissionId.Admin) {
                disableAdminPermissionCard();
        }

        loadCollaborators();
}

export async function loadCollaborators() {
        const added = UsersState.getCollaborators();
        const viewModels = await prepareCollaboratorViewModels(added);

        const invited = UsersState.getInvitedCollaborators();
        setInvitedCollaborators(invited);

        setCollaborators(viewModels);
}

export function triggerRoleChangeDropdown(element: HTMLElement) {
        const permissionId = MasterRegistry.get(workspaceToken).getBoard()?.permission_id;
        const collabPermission = element.dataset.permissionId;

        if (!permissionId || permissionId < PermissionId.Admin || Number(collabPermission) >= permissionId) return;

        if (permissionId == PermissionId.Admin) {
                hideAdminRoleInDropdown();
        }

        setActiveRoleInDropdown(permissionId);

        const rect = element.getBoundingClientRect();

        const collabDiv = element.closest(".collaborator-div") as HTMLElement;
        HTML.changeRoleDropdown.dialog.dataset.accountId = collabDiv.dataset.id;

        openRoleChangeDropdown(rect.left, rect.bottom + 2);
}

export async function prepareCollaboratorViewModels(
        collaborators: Collaborator[]
): Promise<CollaboratorViewModel[]> {
        const acc = await supabase.getAccount();
        if (!acc) throw new Error("Account was not set");

        const userPerm = MasterRegistry.get(workspaceToken).getBoard()?.permission_id;
        if (userPerm === undefined) throw new Error("User board permissions not set");

        return collaborators.map(c => prepareCollaboratorViewModel(c, acc.id!, userPerm));
}

export function prepareCollaboratorViewModel(
        c: Collaborator,
        currentAccountId: string,
        currentUserPerm: PermissionId
): CollaboratorViewModel {
        const isMe = c.account_id === currentAccountId;
        const role = PermissionId[c.permission_id];

        const canChangePerm = !isMe && (
                currentUserPerm === PermissionId.Owner ||
                (currentUserPerm === PermissionId.Admin && c.permission_id < PermissionId.Admin)
        );

        const canRemove = !isMe && (
                currentUserPerm === PermissionId.Owner ||
                currentUserPerm === PermissionId.Admin
        );

        return {
                id: c.account_id,
                name: c.name,
                email: c.email,
                avatarUrl: c.avatar_url,
                role,
                permissionId: c.permission_id,
                formattedDate: new Date(c.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                isMe,
                canChangePerm,
                canRemove
        };
}
