import { entryEvents } from "@/features/board/entries/custom-events";
import { HTML } from "./html";
import { navigate } from "@/core/utils/router";
import { automationEvents } from "@/features/board/automations/custom-events";
import { workspaceEvents } from "@/features/board/workspace/custom-events";
import { userManagementEvents } from "@/features/board/user-management/custom-events";
import { recoverBoard } from "./logic";
import { historyEvents } from "@/features/board/history/custom-events";
import { topToolbarEvents } from "./custom-events";
import { hideAllButtons, setBoardSettings } from "./ui";

let isInitialized = false;

export function initTopToolbarEvents() {
        if (isInitialized) return;
        isInitialized = true;

        HTML.btns.recover.addEventListener("click", () => recoverBoard());

        HTML.btns.newEntry.addEventListener("click", () => window.dispatchEvent(entryEvents.newRow()));

        HTML.btns.addUser.addEventListener("click", () => window.dispatchEvent(userManagementEvents.showModal()));

        HTML.title.div.addEventListener("click", () => window.dispatchEvent(workspaceEvents.showEditBoardModal()));

        HTML.backButton.addEventListener("click", async () => {
                await navigate("/dashboard");
                window.dispatchEvent(workspaceEvents.clearAll());
        });

        HTML.btns.history.addEventListener("click", () => window.dispatchEvent(historyEvents.showModal()));

        HTML.btns.leaveBoardModal.addEventListener("click", () => window.dispatchEvent(workspaceEvents.showLeaveModal()));

        HTML.btns.deleteBoardModal.addEventListener("click", () => window.dispatchEvent(workspaceEvents.showDeleteModal()));

        HTML.btns.automations.addEventListener("click", () => window.dispatchEvent(automationEvents.showModal()));

        window.addEventListener(topToolbarEvents.setBorderColorAndName.type, (e: Event) => {
                const { color, name } = (e as ReturnType<typeof topToolbarEvents.setBorderColorAndName>).detail;
                setBoardSettings(name, color);
        });

        window.addEventListener(topToolbarEvents.clearButtons.type, () => hideAllButtons());
}
