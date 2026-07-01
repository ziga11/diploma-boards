import type { Board } from "./types";

export const dashboardEvents = {
        addMultipleBoards: Object.assign(
                (detail: { boards: Array<Board>, type: "owned" | "shared" }) => new CustomEvent("board:add-multiple", { detail }),
                { type: "board:add-multiple" }
        ),

        deleteBoard: Object.assign(
                (detail: string) => new CustomEvent("board:delete", { detail }),
                { type: "board:delete" }
        ),

        hideBoard: Object.assign(
                (detail: string) => new CustomEvent("board:hide", { detail }),
                { type: "board:hide" }
        ),

        showBoard: Object.assign(
                (detail: string) => new CustomEvent("board:show", { detail }),
                { type: "board:show" }
        ),

        showNewNotifications: Object.assign(
                (detail: boolean) => new CustomEvent("board:new-notifications", { detail }),
                { type: "board:new-notifications" }
        ),
}
