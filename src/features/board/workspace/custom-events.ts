export const workspaceEvents = {
        showLeaveModal: Object.assign(
                () => new CustomEvent("workspace:show-leave-modal"),
                { type: "workspace:show-leave-modal" as const }
        ),

        showDeleteModal: Object.assign(
                () => new CustomEvent("workspace:show-delete-modal"),
                { type: "workspace:show-delete-modal" as const }
        ),

        showEditBoardModal: Object.assign(
                () => new CustomEvent("workspace:edit-board-modal"),
                { type: "workspace:edit-board-modal" as const }
        ),

        kickedFromBoard: Object.assign(
                () => new CustomEvent("workspace:board-deleted"),
                { type: "workspace:board-deleted" as const }
        ),

        recoverBoard: Object.assign(
                () => new CustomEvent("workspace:board-recovered"),
                { type: "workspace:board-recovered" as const }
        ),

        boardDeleted: Object.assign(
                () => new CustomEvent("workspace:board-deleted"),
                { type: "workspace:board-deleted" as const }
        ),

        boardTitleUpdate: Object.assign(
                (detail: string) => new CustomEvent("workspace:board-title-change", { detail }),
                { type: "workspace:board-title-change" as const }
        ),

        clearAll: Object.assign(
                () => new CustomEvent("workspace:clear-all"),
                { type: "workspace:clear-all" as const }
        ),
}
