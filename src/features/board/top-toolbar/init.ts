import "./top-toolbar.css";
import { BoardStore } from "../board-state";
import { initTopToolbarEvents } from "./event";
import { HTML } from "./html";
import { applyPermissionRestrictions } from "./view";

export function initTopToolbar() {
        const boardTitle = BoardStore.boardTitle;

        if (!boardTitle) throw new Error("Board title wasnt set");

        applyPermissionRestrictions();

        initTopToolbarEvents();

        HTML.toolbarDiv.style.borderLeftColor = BoardStore.activeBoard!.color!;
        HTML.title.text.dataset.dbValue = boardTitle;
        HTML.title.text.innerText = boardTitle;
}
