import type { Collaborator, InvitedCollaborator } from "./types";

export const userManagementEvents = {
        showModal: Object.assign(() => new CustomEvent("user-management:show-modal"),
                { type: "user-management:show-modal" }),

        addCollaborator: Object.assign(
                (detail: Collaborator) => new CustomEvent("user-management:add-collaborator", { detail }),
                { type: "user-management:add-collaborator" }
        ),

        addInvitedCollaborator: Object.assign(
                (detail: InvitedCollaborator) => new CustomEvent("user-management:add-invited-collaborator", { detail }),
                { type: "user-management:add-invited-collaborator" }
        ),

        removeInvitedCollaborator: Object.assign(
                (detail: InvitedCollaborator) => new CustomEvent("user-management:remove-invited-collaborator", { detail }),
                { type: "user-management:remove-invited-collaborator" }
        ),

        removeCollaborator: Object.assign(
                (detail: string) => new CustomEvent("user-management:remove-collaborator", { detail }),
                { type: "user-management:remove-collaborator" }
        ),

        loadCollaborators: Object.assign(
                () => new CustomEvent("user-management:load-collaborators"),
                { type: "user-management:load-collaborators" }
        ),
}
