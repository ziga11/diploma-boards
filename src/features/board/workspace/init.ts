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
                initWorkspaceEvents();

                BoardStore.setBoard(board);

                return true;
        } catch (err) {
                console.log(err);

                return false;
        }
}
