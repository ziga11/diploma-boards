import { initializeApp } from "../init";
import { boardElements, topToolbar } from "./types";
import { Globals } from "../globals";
import { createFields } from "./utils/field";
import { initScrollObserver } from "./utils/other";
import "./events/export"
import { createEntries } from "./utils/entry";
import { fillExistingAutomations } from "./utils/automation";
import { initTopToolbar } from "./utils/toolbar";
import { fillBoardCollaborators } from "./utils/add-user";

await initializeApp();

const url = new URL(window.location.href);
const params = url.searchParams;

const bId = params.get("boardId") as string;
const boardId = Number(bId);

try {
        const board = await Globals.supabase.fetchBoard(boardId);
        Globals.board = board;

        topToolbar.left.boardTitle.innerText = board.name;
        boardElements.tabTitleTag.innerText = `diploma boards - ${board.name}`;

        const fields = await Globals.supabase.fetchFields(board.id);
        createFields(fields)
        createEntries();
        fillBoardCollaborators();
        fillExistingAutomations();
        initTopToolbar();
        initScrollObserver();
} catch (err) {
        window.location.href = "404.html"
        console.error(err);
}
