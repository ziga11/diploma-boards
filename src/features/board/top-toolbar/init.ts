import "./top-toolbar.css";
import { initTopToolbarEvents } from "./event";
import { HTML } from "./html";
import { MasterRegistry } from "@/features/board/master-registry";
import { workspaceToken } from "@/features/board/workspace/registry";
import { applyPermissionRestrictions } from "./logic";

export function initTopToolbar() {
        const board = MasterRegistry.get(workspaceToken).getBoard();
        if (!board) throw new Error("Board wasnt set");

        applyPermissionRestrictions();

        initTopToolbarEvents();

        HTML.toolbarDiv.style.borderLeftColor = board.color!;
        HTML.title.text.dataset.dbValue = board.name!;
        HTML.title.text.innerText = board.name!;
}
