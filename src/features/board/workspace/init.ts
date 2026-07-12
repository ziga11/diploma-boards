import { supabase } from "@/core/api/supabase";
import { BoardStore } from "../board-state";
import { initWorkspaceEvents } from "./events";
import { HTML } from "./html";
import { initScrollObserver } from "./logic";

export async function initWorkspace(): Promise<boolean> {
        const name = BoardStore.boardTitle;
        const deleted = BoardStore.isDeleted;

        HTML.tabTitleTag.innerText = `Diploma Boards - ${name}`;
        initScrollObserver();

        HTML.container.classList.toggle("disabled", deleted ?? false);
        initWorkspaceEvents();

        supabase.initBoardRealtime().catch(err => { throw err });
        return true;
}
