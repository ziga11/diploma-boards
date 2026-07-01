import { setStateClass, showToast } from "@/core/utils/dom";
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
                if (elem.className != "board-entry") return;

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
                const type = detail.type as "owned" | "shared";

                const div = type == "owned" ? HTML.boardList.owned.boardDiv : HTML.boardList.shared.boardDiv;
                const hiddenDiv = type == "owned" ? HTML.boardList.owned.noBoards : HTML.boardList.shared.noBoards;

                div.append(...boards.map(board => createBoard(board)));
                setStateClass([div], [hiddenDiv], "shown");
        });

        window.addEventListener(dashboardEvents.deleteBoard.type, (e: Event) => {
                const id = (e as ReturnType<typeof dashboardEvents.deleteBoard>).detail;

                const boardElem: HTMLDivElement | null = HTML.boardList.div.querySelector(`[data-board-id="${id}"]`);

                const boardDiv = boardElem?.parentElement as HTMLDivElement;
                boardElem?.remove();

                if (boardDiv.children.length == 0) {
                        const noBoardsDiv = boardDiv.nextElementSibling as HTMLDivElement;
                        setStateClass([noBoardsDiv], [boardDiv], "shown")
                }
        });

        window.addEventListener(dashboardEvents.hideBoard.type, (e: Event) => {
                const boardId = (e as ReturnType<typeof dashboardEvents.hideBoard>).detail;

                const boardElem = HTML.boardList.div.querySelector(`[data-board-id="${boardId}"]`);
                const boardDiv = boardElem?.parentElement as HTMLDivElement;

                boardElem?.classList.add("hidden");

                if (boardDiv.children.length <= 1) {
                        const noBoardsDiv = boardDiv.nextElementSibling as HTMLDivElement;

                        setStateClass([noBoardsDiv], [boardDiv], "shown")
                }
        });

        window.addEventListener(dashboardEvents.showBoard.type, (e: Event) => {
                const boardId = (e as ReturnType<typeof dashboardEvents.showBoard>).detail;

                const boardElem = HTML.boardList.div.querySelector(`[data-board-id="${boardId}"]`);
                boardElem?.classList.remove("hidden");

                const boardDiv = boardElem?.parentElement as HTMLDivElement;
                if (boardDiv.children.length >= 1) {
                        const noBoardsDiv = boardDiv.nextElementSibling as HTMLDivElement;
                        setStateClass([boardDiv], [noBoardsDiv], "shown")
                }
        });


        window.addEventListener(dashboardEvents.showNewNotifications.type, (e: Event) => {
                const shown = (e as ReturnType<typeof dashboardEvents.showNewNotifications>).detail;

                const showArr = shown ? [HTML.toolbar.notification.spanNewNotifications] : [];
                const hideArr = shown ? [] : [HTML.toolbar.notification.spanNewNotifications];

                setStateClass(showArr, hideArr, "shown");
        });
}
