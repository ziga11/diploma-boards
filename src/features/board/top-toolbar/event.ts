import { BoardStore } from "../board-state";
import { entryEvents } from "../entries/custom-events";
import { HTML } from "./html";
import { navigate } from "@/core/utils/router";
import { automationEvents } from "../automations/custom-events";
import { workspaceEvents } from "../workspace/custom-events";
import { userManagementEvents } from "../user-management/custom-events";
import { fieldEvents } from "../fields/custom-events";
import { setStateClass } from "@/core/utils/dom";
import { recoverBoard, updateBoard } from "./logic";
import { historyEvents } from "../history/custom-events";
import { dashboardEvents } from "@/features/dashboard/workspace/custom-events";
import { applyPermissionRestrictions } from "./view";

export function initTopToolbarEvents() {
        if (BoardStore.isInitialized) return;

        HTML.btns.recover.addEventListener("click", () => {
                recoverBoard()
                        .then(_ => applyPermissionRestrictions());

                const id = BoardStore.boardId;
                if (!id) return;


                window.dispatchEvent(workspaceEvents.recoverBoard());
                window.dispatchEvent(dashboardEvents.moveBoard({ id, group: "owned" }));
        });

        HTML.btns.newEntry.addEventListener("click", () => window.dispatchEvent(entryEvents.newRow()));

        HTML.btns.addUser.addEventListener("click", () => window.dispatchEvent(userManagementEvents.showModal()));

        HTML.title.icons.hover.div.addEventListener("click", () => {
                HTML.title.text.focus();
        });

        HTML.title.text.addEventListener("focus", () => {
                setStateClass([HTML.title.icons.edit.div], [HTML.title.icons.hover.div], "shown");
        });

        HTML.title.text.addEventListener("focusout", (e: FocusEvent) => {
                if (HTML.title.icons.edit.confirm == e.relatedTarget as HTMLButtonElement) {
                        const newName = HTML.title.text.innerText;
                        if (newName == HTML.title.text.dataset.dbValue) return;

                        updateBoard(newName);
                        window.dispatchEvent(dashboardEvents.updateBoard({ id: BoardStore.boardId!, name: newName }));
                }

                setStateClass([HTML.title.icons.hover.div], [HTML.title.icons.edit.div], "shown");
        });

        HTML.backButton.addEventListener("click", () => {
                window.dispatchEvent(fieldEvents.disposeAll());
                window.dispatchEvent(entryEvents.disposeAll());

                navigate("/dashboard");
        });

        HTML.btns.history.addEventListener("click", () => {
                console.log("hehe xD");

                window.dispatchEvent(historyEvents.showModal());
        });

        HTML.btns.leaveBoardModal.addEventListener("click", () => window.dispatchEvent(workspaceEvents.showLeaveModal()));

        HTML.btns.deleteBoardModal.addEventListener("click", () => window.dispatchEvent(workspaceEvents.showDeleteModal()));

        HTML.btns.automations.addEventListener("click", () => window.dispatchEvent(automationEvents.showModal()));
}
