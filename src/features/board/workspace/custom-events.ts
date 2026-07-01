export const workspaceEvents = {
        showLeaveModal: Object.assign(
                () => new CustomEvent("workspace:show-leave-modal"),
                { type: "workspace:show-leave-modal" as const }
        ),

        showDeleteModal: Object.assign(
                () => new CustomEvent("workspace:show-delete-modal"),
                { type: "workspace:show-delete-modal" as const }
        ),
}
