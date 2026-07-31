import { navigate } from "@/core/utils/router";
import { workspaceEvents } from "./custom-events";
import { HTML } from "./html";
import { onUpdateBoardBtnPress, onDeleteBoardBtnPress, onLeaveBoardBtnPress, onEditBoardBtnPress } from "./logic";
import { showToast } from "@/core/utils/dom";
import { hexChange, setBoardTitle, updateColor } from "./view";
import { fieldEvents } from "@/features/board/fields/custom-events";
import { entryEvents } from "@/features/board/entries/custom-events";
import { topToolbarEvents } from "@/features/board/top-toolbar/custom-events";

export function initWorkspaceEvents() {
        HTML.delete.confirm.addEventListener("click", async () => {
                await onDeleteBoardBtnPress();
        });

        HTML.leave.confirm.addEventListener("click", async () => {
                await onLeaveBoardBtnPress();
        });

        HTML.editBoard.modal.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.className == "preset-color") {
                        updateColor(elem.dataset.color!);
                }
                else if (elem == HTML.editBoard.updateBoard) {
                        onUpdateBoardBtnPress();
                }
        });

        HTML.editBoard.hexInput.addEventListener("input", () => hexChange(HTML.editBoard.hexInput.value));

        window.addEventListener(workspaceEvents.showLeaveModal.type, () => HTML.leave.modal.showModal());

        window.addEventListener(workspaceEvents.showEditBoardModal.type, () => onEditBoardBtnPress());

        window.addEventListener(workspaceEvents.showDeleteModal.type, () => HTML.delete.modal.showModal());

        window.addEventListener(workspaceEvents.boardDeleted.type, async () => {
                await navigate("/dashboard");
                showToast("The board was deleted");
                window.dispatchEvent(workspaceEvents.clearAll());
        });

        window.addEventListener(workspaceEvents.kickedFromBoard.type, async () => {
                await navigate("/dashboard");
                showToast("You've been kicked from the board");
                window.dispatchEvent(workspaceEvents.clearAll());
        });

        window.addEventListener(workspaceEvents.boardTitleUpdate.type, (e: Event) => {
                const newTitle = (e as ReturnType<typeof workspaceEvents.boardTitleUpdate>).detail;

                setBoardTitle(newTitle);
        });

        window.addEventListener(workspaceEvents.recoverBoard.type, () => {
                HTML.container.classList.remove("disabled");
        });

        window.addEventListener(workspaceEvents.clearAll.type, () => {
                window.dispatchEvent(fieldEvents.clearFields())
                window.dispatchEvent(topToolbarEvents.clearButtons())
                window.dispatchEvent(entryEvents.clearEntries())
        });
}
