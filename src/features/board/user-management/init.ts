import { BoardStore } from "../board-state";
import { initUserManagementEvents } from "./event";
import { disableInputs } from "./view";

export function initUserManagement() {
        const permissionId = BoardStore.permissionId;
        disableInputs(permissionId);

        initUserManagementEvents();
}
