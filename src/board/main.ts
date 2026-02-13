import { initializeApp } from "../init";
await initializeApp();


import { Globals } from "../globals";
import "./events"
import { boardElements } from "./types";
import { createFields, createEntries, fillExistingAutomations, initScrollObserver } from "./utils";

const url = new URL(window.location.href);
const params = url.searchParams;

const boardId = params.get("boardId") as string;
const title = params.get("title") as string;

Globals.boardId = Number(boardId);

boardElements.boardHeadTitle.innerText = title;
boardElements.tabTitleTag.innerText = `diploma boards - ${title}`;

const fields = await Globals.supabase.fetchFields(Globals.boardId);
fillExistingAutomations();
createFields(fields).then(_ => {
        initScrollObserver();
        createEntries();
});
