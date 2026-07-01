import { navigate } from "@/core/utils/router";
import { workspaceEvents } from "./custom-events";
import { HTML } from "./html";
import { deleteBoard, leaveBoard } from "./logic";
import { dashboardEvents } from "@/features/dashboard/workspace/custom-events";
import { BoardStore } from "../board-state";
import { showToast } from "@/core/utils/dom";

export function initWorkspaceEvents() {
        if (BoardStore.isInitialized) return;

        HTML.delete.confirm.addEventListener("click", () => {
                const id = BoardStore.boardId;
                if (!id) return;


                HTML.delete.modal.close();
                navigate("/dashboard");
                window.dispatchEvent(dashboardEvents.hideBoard(id))
                deleteBoard()
                        .then(_ => {
                                window.dispatchEvent(dashboardEvents.deleteBoard(id))
                        })
                        .catch(err => {
                                window.dispatchEvent(dashboardEvents.showBoard(id))
                                showToast(`Failed to delete board: ${err}`, "error")
                        });
        });

        HTML.leave.confirm.addEventListener("click", () => {
                const id = BoardStore.boardId;
                if (!id) return;

                HTML.leave.modal.close();
                navigate("/dashboard");
                window.dispatchEvent(dashboardEvents.hideBoard(id))
                leaveBoard()
                        .then(_ => window.dispatchEvent(dashboardEvents.deleteBoard(id)))
                        .catch(err => {
                                window.dispatchEvent(dashboardEvents.showBoard(id))
                                showToast(`Failed to delete board: ${err}`, "error")
                        });
        });

        window.addEventListener(workspaceEvents.showLeaveModal.type, () => HTML.leave.modal.showModal());

        window.addEventListener(workspaceEvents.showDeleteModal.type, () => HTML.delete.modal.showModal());
}
