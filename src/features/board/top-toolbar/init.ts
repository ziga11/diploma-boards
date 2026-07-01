import { BoardStore } from "../board-state";
import { initTopToolbarEvents } from "./event";
import { HTML } from "./html";
import { applyPermissionRestrictions } from "./view";

export function initTopToolbar() {
        const boardTitle = BoardStore.boardTitle;

        if (!boardTitle) throw new Error("Board title wasnt set");

        applyPermissionRestrictions();

        initTopToolbarEvents();
        HTML.title.text.dataset.dbValue = boardTitle;
        HTML.title.text.innerText = boardTitle;
}
