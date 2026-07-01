import { PermissionId } from "@/core/types/auth";
import { BoardStore } from "../board-state";
import { initUserManagementEvents } from "./event";
import { disableInputs } from "./view";

export function initUserManagement() {
        const permission = BoardStore.permissionId;
        if (permission != PermissionId.Admin) disableInputs();

        initUserManagementEvents();
}
