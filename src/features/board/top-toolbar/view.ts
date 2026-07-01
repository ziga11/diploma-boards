import { PermissionId } from "@/core/types/auth";
import { BoardStore } from "../board-state";
import { setStateClass } from "@/core/utils/dom";
import { HTML } from "./html";

export function applyPermissionRestrictions() {
        const permission = BoardStore.permissionId;
        if (!permission) throw new Error(`Permissions not set`);


        if (permission >= PermissionId.Editor) {
                setStateClass([HTML.btns.newEntry], [], "shown")
        }

        if (permission >= PermissionId.Manager) {
                setStateClass([HTML.btns.automations], [], "shown")
        }

        if (permission == PermissionId.Admin) {
                setStateClass([HTML.btns.history], [], "shown");
                setStateClass([HTML.btns.deleteBoardModal], [], "shown")
                setStateClass([HTML.btns.addUser], [], "shown")
        }
        else {
                setStateClass([HTML.btns.leaveBoardModal], [], "shown")
        }
}
