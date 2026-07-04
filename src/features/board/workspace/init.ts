import { supabase } from "@/core/api/supabase";
import { BoardStore } from "../board-state";
import { initWorkspaceEvents } from "./events";
import { HTML } from "./html";
import { fetchBoard, initScrollObserver } from "./logic";

export async function initWorkspace(props: Record<string, any>): Promise<boolean> {
        const boardId = props["board_id"];

        try {
                const board = await fetchBoard(boardId);

                HTML.tabTitleTag.innerText = `diploma boards - ${board.name}`;
                initScrollObserver();

                HTML.container.classList.toggle("disabled", board.deleted);
                initWorkspaceEvents();

                BoardStore.setBoard(board);

                supabase.initBoardRealtime();
                return true;
        } catch (err) {
                console.log(err);

                return false;
        }
}
