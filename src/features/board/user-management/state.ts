import type { Collaborator, InvitedCollaborator } from "./types";
import { PermissionId } from "@/core/types/auth";

interface UsersState {
        isInitialized: boolean;
        collaborators: Collaborator[];
        invitedCollaborators: InvitedCollaborator[];
}

const state: UsersState = {
        isInitialized: false,
        collaborators: [],
        invitedCollaborators: [],
};

export const UsersState = {
        isInitialized() { return state.isInitialized; },

        setInitalized() { state.isInitialized = true; },

        getCollaborators() {
                return state.collaborators;
        },

        setCollaborators(collaborators: Collaborator[]) {
                state.collaborators = collaborators;
        },

        addCollaborator(collaborator: Collaborator) {
                state.collaborators.push(collaborator)
        },

        removeCollaborator(accountId: string) {
                const ind = state.collaborators.findIndex(c => c.account_id == accountId);
                if (!ind) return;

                state.collaborators.splice(ind, 1);
        },

        updateCollaboratorPermission(accountId: string, permissionId: PermissionId) {
                const ind = state.collaborators.findIndex(c => c.account_id == accountId);
                if (!ind) return;

                state.collaborators[ind].permission_id = permissionId;
        },

        getInvitedCollaborators() {
                return state.invitedCollaborators;
        },

        setInvitedCollaborators(invitedCollaborator: InvitedCollaborator[]) {
                state.invitedCollaborators = invitedCollaborator;
        },

        addInvitedCollaborator(invitedCollaborator: InvitedCollaborator) {
                state.invitedCollaborators.push(invitedCollaborator)
        },

        removeInvitedCollaborator(email: string) {
                const ind = state.invitedCollaborators.findIndex(c => c.to_email = email);
                if (!ind) return;

                state.invitedCollaborators.splice(ind, 1);
        },

        /*TODO: Invited to collaborators transfer? */
};
