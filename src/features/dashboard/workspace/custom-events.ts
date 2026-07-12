import type { Board } from "./types";

export const dashboardEvents = {
        addMultipleBoards: Object.assign(
                (detail: { boards: Array<Board>, type: "owned" | "shared" | "deleted" }) => new CustomEvent("board:add-multiple", { detail }),
                { type: "board:add-multiple" }
        ),

        updateBoard: Object.assign(
                (detail: Board) => new CustomEvent("board:update", { detail }),
                { type: "board:update" }
        ),

        removeBoard: Object.assign(
                (detail: string) => new CustomEvent("board:delete", { detail }),
                { type: "board:delete" }
        ),

        setBoardClass: Object.assign(
                (detail: { id: string, state: string }) => new CustomEvent("board:hide", { detail }),
                { type: "board:hide" }
        ),

        removeBoardClass: Object.assign(
                (detail: { id: string, state: string }) => new CustomEvent("board:show", { detail }),
                { type: "board:show" }
        ),

        moveBoard: Object.assign(
                (detail: { id: string, group: "owned" | "shared" | "deleted" }) => new CustomEvent("board:move-to-deleted", { detail }),
                { type: "board:move-to-deleted" }
        ),
}
