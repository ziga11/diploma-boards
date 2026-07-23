import { navigate } from "@/core/utils/router";
import { workspaceEvents } from "./custom-events";
import { HTML } from "./html";
import { deleteBoard, leaveBoard, updateBoard } from "./logic";
import { dashboardEvents } from "@/features/dashboard/workspace/custom-events";
import { BoardState } from "../board-state";
import { closeDialog, setStateClass, showToast } from "@/core/utils/dom";
import { hexChange, updateColor } from "./view";
import { topToolbarEvents } from "../top-toolbar/custom-events";

export function initWorkspaceEvents() {
        if (BoardState.isInitialized) return;

        HTML.delete.confirm.addEventListener("click", () => {
                const id = BoardState.boardId;
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
                const id = BoardState.boardId;
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

        HTML.editBoard.modal.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.className == "preset-color") {
                        updateColor(elem.dataset.color!);
                }
                else if (elem == HTML.editBoard.updateBoard) {
                        const name = HTML.editBoard.nameInput.value;
                        const color = HTML.editBoard.colorPicker.value;
                        const activeBoard = BoardState.activeBoard;

                        if (name == activeBoard?.name && color.toUpperCase() == activeBoard.color?.toUpperCase()) {
                                return;
                        }

                        window.dispatchEvent(topToolbarEvents.setBorderColorAndName({ color, name }));

                        updateBoard(name, color);
                        closeDialog(HTML.editBoard.modal);
                }
        });

        HTML.editBoard.hexInput.addEventListener("input", () => hexChange(HTML.editBoard.hexInput.value));

        window.addEventListener(workspaceEvents.showLeaveModal.type, () => HTML.leave.modal.showModal());

        window.addEventListener(workspaceEvents.showEditBoardModal.type, () => {
                const boardColor = BoardState.activeBoard!.color!;
                HTML.editBoard.colorPicker.value = boardColor;
                HTML.editBoard.hexInput.value = boardColor;

                HTML.editBoard.nameInput.value = BoardState.activeBoard!.name!;

                HTML.editBoard.presetColors.forEach(color => {
                        color.classList.toggle("active", color.dataset.color?.toLowerCase() == boardColor.toLowerCase())
                });

                HTML.editBoard.modal.showModal();
        });

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
