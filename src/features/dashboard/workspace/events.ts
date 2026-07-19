import { showToast } from "@/core/utils/dom";
import { HTML } from "./html";
import { boardLink, logOut } from "./logic";
import { createBoard } from "./view";
import type { Board } from "./types";
import { dashboardEvents } from "./custom-events";
import { navigate } from "@/core/utils/router";
import { apiKeyEvents } from "../api-keys/custom-events";
import { addBoardEvents } from "../add-board/custom-events";
import { notificationEvents } from "../notifications/custom-events";

export function initWorkspaceEvents() {
        HTML.boardList.div.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] != "board-entry") return;

                const id = elem.dataset.boardId;
                if (!id) return;

                navigate(boardLink(id));
        });

        HTML.toolbar.apiModalBtn.addEventListener("click", () => window.dispatchEvent(apiKeyEvents.showModal()));

        [HTML.toolbar.addBoardModalBtn, HTML.toolbar.addBoardModalCtaBtn].forEach(btn => {
                btn.addEventListener("click", () => window.dispatchEvent(addBoardEvents.showModal()));
        });

        HTML.toolbar.notification.btn.addEventListener("click", () => window.dispatchEvent(notificationEvents.showModal()))

        HTML.toolbar.profileDiv.addEventListener("click", async () => {
                logOut()
                        .then(_ => navigate("/login"))
                        .catch(err => showToast(`Failed to sign you out ${err}`, "error"));
        });

        window.addEventListener(dashboardEvents.addMultipleBoards.type, (e: Event) => {
                const detail = (e as ReturnType<typeof dashboardEvents.addMultipleBoards>).detail;

                const boards = detail.boards as Array<Board>;
                const type = detail.type as "owned" | "shared" | "deleted";

                const boardElems = boards.map(board => createBoard(board));

                switch (type) {
                        case "owned":
                                HTML.boardList.owned.boardDiv.append(...boardElems);
                                break;
                        case "shared":
                                HTML.boardList.shared.boardDiv.append(...boardElems);
                                break;
                        case "deleted":
                                HTML.boardList.deleted.boardDiv.append(...boardElems);
                                break;
                }
        });

        window.addEventListener(dashboardEvents.removeBoard.type, (e: Event) => {
                const id = (e as ReturnType<typeof dashboardEvents.removeBoard>).detail;

                const boardElem: HTMLDivElement | null = HTML.boardList.div.querySelector(`[data-board-id="${id}"]`);
                const isOwner = boardElem?.closest(".deleted-boards") != null;

                if (isOwner) return;
                boardElem?.remove();
        });

        window.addEventListener(dashboardEvents.setBoardClass.type, (e: Event) => {
                const { id, state } = (e as ReturnType<typeof dashboardEvents.setBoardClass>).detail;

                const boardElem = HTML.boardList.div.querySelector(`[data-board-id="${id}"]`);
                boardElem?.classList.add(state);
        });

        window.addEventListener(dashboardEvents.moveBoard.type, (e: Event) => {
                const { id, group } = (e as ReturnType<typeof dashboardEvents.moveBoard>).detail;

                const boardElem = HTML.boardList.div.querySelector(`[data-board-id="${id}"]`);
                if (!boardElem) return;

                boardElem.remove();

                let div: HTMLDivElement;

                switch (group) {
                        case "owned":
                                boardElem.classList.remove("deleted");
                                div = HTML.boardList.owned.boardDiv;
                                break;
                        case "shared":
                                boardElem.classList.remove("deleted");
                                div = HTML.boardList.shared.boardDiv;
                                break;
                        case "deleted":
                                boardElem.classList.add("deleted");
                                div = HTML.boardList.deleted.boardDiv;
                                break;
                }
                div!.appendChild(boardElem);
        });

        window.addEventListener(dashboardEvents.removeBoardClass.type, (e: Event) => {
                const { id, state } = (e as ReturnType<typeof dashboardEvents.removeBoardClass>).detail;

                const boardElem = HTML.boardList.div.querySelector(`[data-board-id="${id}"]`);
                boardElem?.classList.remove(state);
        });

        window.addEventListener(dashboardEvents.updateBoard.type, (e: Event) => {
                const { id, name, color } = (e as ReturnType<typeof dashboardEvents.updateBoard>).detail;

                const boardElem = HTML.boardList.div.querySelector(`.board-entry[data-board-id="${id}"]`) as HTMLDivElement;
                const titleElem = boardElem.querySelector(".board-title") as HTMLDivElement;

                if (name) {
                        titleElem.innerText = name;
                }
                if (color) {
                        boardElem.style.borderLeftColor = color;
                }
        });
}
