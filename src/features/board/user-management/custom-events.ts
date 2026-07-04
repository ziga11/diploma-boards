import type { BoardCollaborator } from "./types";

export const userManagementEvents = {
        showModal: Object.assign(() => new CustomEvent("user-management:show-modal"),
                { type: "user-management:show-modal" }),

        addCollaborator: Object.assign(
                (detail: BoardCollaborator) => new CustomEvent("user-management:add-collaborator", { detail }),
                { type: "user-management:add-collaborator" }
        ),

        removeCollaborator: Object.assign(
                (detail: string) => new CustomEvent("user-management:remove-collaborator", { detail }),
                { type: "user-management:remove-collaborator" }
        ),
}
