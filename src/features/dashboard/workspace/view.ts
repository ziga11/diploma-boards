import { getAccount, sanitizeHTML } from "@/core/utils/utils";
import type { BoardFetchObject, Board } from "./types";
import { HTML } from "./html";
import { getDominantColor } from "./view-utils";
import { setStateClass } from "@/core/utils/dom";
import { dashboardEvents } from "./custom-events";

export function createBoard(board: Board): HTMLDivElement {
        const div = Object.assign(document.createElement('div'), { className: "board-entry" });
        Object.assign(div.dataset, { boardId: `${board.id}`, name: board.name });

        div.style.borderLeftColor = board.color!;

        const formattedDate = new Date(board.date_created ?? Date.now()).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
        });

        div.innerHTML = sanitizeHTML`
                <div class="board-title">${board.name}</div>
                <div class="board-meta">
                        <div class="id-div"><span class="id-text" title="${board.id}">ID: ${board.id?.slice(0, 6)}...</span></div>
                        <span class="board-date">Created: ${formattedDate}</span>
                </div>
        `;

        return div;
}

export function updateBoard(elem: HTMLDivElement, board: Board) {
        elem.dataset.boardId = `${board.id}`;
        const boardIdSpan = elem.querySelector(".board-id") as HTMLSpanElement;

        boardIdSpan.innerText = `ID: ${board.id}`
}

export async function setUserData() {
        const acc = await getAccount();
        if (!acc) throw new Error(`Not logged in`);

        HTML.toolbar.profileImg.src = acc.avatar_url!;
        HTML.toolbar.profileImg.onload = () => {
                HTML.toolbar.profileImg.style.setProperty("--profile-border", getDominantColor(HTML.toolbar.profileImg));
        }

        HTML.toolbar.userBoards.innerText = `${acc?.name} - Board Dashboard`;
}

export async function fillBoards(boardObject: BoardFetchObject) {
        const hasOwnBoards = boardObject.owned.length > 0;
        setStateClass([hasOwnBoards ? HTML.boardList.owned.boardDiv : HTML.boardList.owned.noBoards], [], "shown")

        if (hasOwnBoards) {
                window.dispatchEvent(dashboardEvents.addMultipleBoards({ boards: boardObject.owned, type: "owned" }));
        }

        const hasSharedBoards = boardObject.shared.length > 0;
        setStateClass(hasSharedBoards ? [HTML.boardList.shared.boardDiv] : [HTML.boardList.shared.noBoards], [], "shown")

        if (hasSharedBoards) {
                window.dispatchEvent(dashboardEvents.addMultipleBoards({ boards: boardObject.shared, type: "shared" }));
        }
}
