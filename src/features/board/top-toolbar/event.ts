import { BoardStore } from "../board-state";
import { entryEvents } from "../entries/custom-events";
import { HTML } from "./html";
import { navigate } from "@/core/utils/router";
import { automationEvents } from "../automations/custom-events";
import { workspaceEvents } from "../workspace/custom-events";
import { userManagementEvents } from "../user-management/custom-events";
import { fieldEvents } from "../fields/custom-events";
import { recoverBoard } from "./logic";
import { historyEvents } from "../history/custom-events";
import { dashboardEvents } from "@/features/dashboard/workspace/custom-events";
import { applyPermissionRestrictions } from "./view";
import { topToolbarEvents } from "./custom-events";

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

        HTML.title.div.addEventListener("click", () => {
                window.dispatchEvent(workspaceEvents.showEditBoardModal());
        });

        HTML.backButton.addEventListener("click", () => {
                window.dispatchEvent(fieldEvents.disposeAll());
                window.dispatchEvent(entryEvents.disposeAll());

                navigate("/dashboard");
        });

        HTML.btns.history.addEventListener("click", () => {
                window.dispatchEvent(historyEvents.showModal());
        });

        HTML.btns.leaveBoardModal.addEventListener("click", () => window.dispatchEvent(workspaceEvents.showLeaveModal()));

        HTML.btns.deleteBoardModal.addEventListener("click", () => window.dispatchEvent(workspaceEvents.showDeleteModal()));

        HTML.btns.automations.addEventListener("click", () => window.dispatchEvent(automationEvents.showModal()));

        window.addEventListener(topToolbarEvents.setBorderColorAndName.type, (e: Event) => {
                const { color, name } = (e as ReturnType<typeof topToolbarEvents.setBorderColorAndName>).detail;
                HTML.toolbarDiv.style.borderLeftColor = color;
                HTML.title.text.innerText = name;
                HTML.title.text.dataset.dbValue = name;
        });

        window.addEventListener(topToolbarEvents.applyPermissionRestrictions.type, () => {
                applyPermissionRestrictions();
        });
}
