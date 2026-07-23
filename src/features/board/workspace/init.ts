import "./workspace.css";
import { supabase } from "@/core/api/supabase";
import { BoardState } from "../board-state";
import { initWorkspaceEvents } from "./events";
import { HTML } from "./html";
import { initScrollObserver } from "./logic";

export async function initWorkspace(): Promise<boolean> {
        const name = BoardState.boardTitle;
        const deleted = BoardState.isDeleted;

        HTML.tabTitleTag.innerText = `Diploma Boards - ${name}`;
        initScrollObserver();

        HTML.container.classList.toggle("disabled", deleted ?? false);
        initWorkspaceEvents();

        supabase.initBoardRealtime().catch(err => { throw err });
        return true;
}
