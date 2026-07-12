import { HTML } from "./html";
import { hexChange, updateColor } from "./view";
import { insertBoard } from "./logic";
import { closeDialog, showToast } from "@/core/utils/dom";
import { dashboardEvents } from "../workspace/custom-events";
import { addBoardEvents } from "./custom-events";
import type { Board } from "../workspace/types";
import { PermissionId } from "@/core/types/auth";

export function initAddBoardEvents() {
        HTML.colorPicker.addEventListener('input', () => updateColor(HTML.colorPicker.value));

        HTML.hexInput.addEventListener('input', () => hexChange(HTML.hexInput.value));

        HTML.presetColors.forEach(button => button.addEventListener('click', function() {
                updateColor(this.dataset.color!);
        }));

        HTML.addBtn.addEventListener("click", async () => {
                const name = HTML.boardName.value;
                const color = HTML.hexInput.value;

                closeDialog(HTML.modal);

                const board = {
                        id: crypto.randomUUID(),
                        date_created: new Date(),
                        is_owner: true,
                        permission_id: PermissionId.Admin,
                        deleted: false,
                        name,
                        color,
                } as Board;

                window.dispatchEvent(dashboardEvents.addMultipleBoards({
                        boards: [board],
                        type: "owned",
                }));

                /* Add inserting class to the board*/
                insertBoard(board)
                        .catch(err => {
                                showToast(`Failed to insert new board ${err}`, "error");
                                window.dispatchEvent(dashboardEvents.removeBoard(board.id!))
                        });
        });

        window.addEventListener(addBoardEvents.showModal.type, () => HTML.modal.showModal());
}
