import { navigate } from "@/core/utils/router";
import { workspaceEvents } from "./custom-events";
import { HTML } from "./html";
import { deleteBoard, leaveBoard } from "./logic";
import { dashboardEvents } from "@/features/dashboard/workspace/custom-events";
import { BoardStore } from "../board-state";
import { setStateClass, showToast } from "@/core/utils/dom";

export function initWorkspaceEvents() {
        if (BoardStore.isInitialized) return;

        HTML.delete.confirm.addEventListener("click", () => {
                const id = BoardStore.boardId;
                if (!id) return;


                HTML.delete.modal.close();
                navigate("/dashboard");
                window.dispatchEvent(dashboardEvents.moveBoard({ id, group: "deleted" }))
                deleteBoard()
                        .catch(err => {
                                window.dispatchEvent(dashboardEvents.moveBoard({ id, group: "owned" }))
                                showToast(`Failed to delete board: ${err}`, "error")
                        });
        });

        HTML.leave.confirm.addEventListener("click", () => {
                const id = BoardStore.boardId;
                if (!id) return;

                HTML.leave.modal.close();
                navigate("/dashboard");
                window.dispatchEvent(dashboardEvents.setBoardClass({ id, state: "hidden" }))

                leaveBoard()
                        .then(_ => window.dispatchEvent(dashboardEvents.removeBoard(id)))
                        .catch(err => {
                                window.dispatchEvent(dashboardEvents.removeBoardClass({ id, state: "hidden" }))
                                showToast(`Failed to delete board: ${err}`, "error")
                        });
        });

        window.addEventListener(workspaceEvents.showLeaveModal.type, () => HTML.leave.modal.showModal());

        window.addEventListener(workspaceEvents.showDeleteModal.type, () => HTML.delete.modal.showModal());

        window.addEventListener(workspaceEvents.boardDeleted.type, () => {
                showToast("The board was deleted");
                navigate("/dashboard");
        });

        window.addEventListener(workspaceEvents.kickedFromBoard.type, () => {
                showToast("You've been kicked from the board");
                navigate("/dashboard");
        });

        window.addEventListener(workspaceEvents.boardTitleUpdate.type, (e: Event) => {
                const newTitle = (e as ReturnType<typeof workspaceEvents.boardTitleUpdate>).detail;

                HTML.tabTitleTag.innerText = `Diploma Boards - ${newTitle}`;
                HTML.titleSpan.innerText = newTitle;
        });

        window.addEventListener(workspaceEvents.recoverBoard.type, () => {
                setStateClass([], [HTML.container], "disabled");
        });
}
