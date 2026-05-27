import { Globals } from "../globals";
import type { ApiKey, InsertBoard, ViewBoard, ViewNotification } from "../types";
import { getAccount, setStateClass } from "../utils";
import { boardElements, addBoardModal, notificationModal, apiKeyModal } from "./html";

export function setToolbar() {
        boardElements.profileImg.src = Globals.account!.avatar_url!;
        boardElements.profileImg.onload = () => {
                boardElements.profileImg.style.setProperty("--profile-border", getDominantColor(boardElements.profileImg));
        }

        boardElements.userBoards.innerText = `${Globals.account?.name} - Board Dashboard`;
}

function getDominantColor(imgElement: HTMLImageElement) {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(imgElement, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

        const rn = r / 255, gn = g / 255, bn = b / 255;
        const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
        const l = (max + min) / 2;
        const d = max - min;
        let h = 0, s = 0;

        if (d !== 0) {
                s = d / (1 - Math.abs(2 * l - 1));
                switch (max) {
                        case rn: h = ((gn - bn) / d) % 6; break;
                        case gn: h = (bn - rn) / d + 2; break;
                        case bn: h = (rn - gn) / d + 4; break;
                }
                h = Math.round(h * 60);
                if (h < 0) h += 360;
        }

        return `hsl(${h}, ${Math.min(s * 120, 100)}%, 25%)`;
}

export async function populateBoards() {
        const boardObject = await Globals.supabase.fetchBoards();

        if (boardObject.owner.length === 0) {
                setStateClass([boardElements.boardList.owned.noBoards], [], "shown");
        }
        else {
                setStateClass([boardElements.boardList.owned.boardDiv], [], "shown");
                for (const board of boardObject.owner) {
                        boardElements.boardList.owned.boardDiv.appendChild(createBoardElem(board));
                }
        }

        if (boardObject.other.length === 0) {
                setStateClass([boardElements.boardList.other.noBoards], [], "shown");
        }
        else {
                setStateClass([boardElements.boardList.other.boardDiv], [], "shown");
                for (const board of boardObject.other) {
                        boardElements.boardList.other.boardDiv.appendChild(createBoardElem(board));
                }
        }
}

export async function fillApiKeys() {
        const keys = await Globals.supabase.fetchApiKeys();

        for (const key of keys) {
                const apiElem = createApikeyElem(key);
                apiKeyModal.listContainer.appendChild(apiElem);
        }
}

export function createBoardElem(board: ViewBoard): HTMLDivElement {
        const div = document.createElement('div');
        div.className = "board-entry";

        const formattedDate = new Date(board.date_created).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
        });


        div.innerHTML = `
                <div class="board-title"></div>
                <div class="board-meta">
                        <span class="board-id">ID: ${board.id}</span>
                        <span class="board-date">Created: ${formattedDate}</span>
                </div>
        `;
        const title = div.querySelector(".board-title") as HTMLDivElement;
        title.textContent = board.name;

        div.style.borderLeftColor = board.color;
        div.setAttribute("boardId", `${board.id}`);

        div.addEventListener("click", () => {
                window.location.href = `/board.html?boardId=${board.id}&title=${encodeURIComponent(board.name)}`;
        });

        return div;
}

export function hexInputChange() {
        let value = addBoardModal.hexInput.value;

        if (!value.startsWith('#')) {
                value = '#' + value;
        }
        if (/^#[0-9A-F]{6}$/i.test(value)) {
                updateColor(value);
        }
}

export function createApikeyElem(apikey: ApiKey): HTMLDivElement {
        const div = document.createElement("div");
        div.innerHTML = `<div class="api-key-row" data-key-id="${apikey.id}">
            <span class="api-key-name"></span>
            <span class="api-key-value"></span>
            <div class="api-key-actions">
                <button type="button" class="api-key-btn copy-key-btn" aria-label="Copy key">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
                    </svg>
                </button>
                <button type="button" class="api-key-btn remove-key-btn" aria-label="Remove key">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                    </svg>
                </button>
            </div>
        </div>`;
        const name = div.querySelector(".api-key-name") as HTMLSpanElement;
        name.textContent = apikey.name;
        const val = div.querySelector(".api-key-value") as HTMLSpanElement;
        val.textContent = apikey.key_preview;

        const copyBtn = div.querySelector(".copy-key-btn") as HTMLButtonElement;
        copyBtn.addEventListener("click", () => {
                navigator.clipboard.writeText(apikey.key);
        });

        const removeBtn = div.querySelector(".remove-key-btn") as HTMLButtonElement;
        removeBtn.addEventListener("click", () => {
                div.remove();
                Globals.supabase.removeApiKey(apikey.id);
        });

        return div;
}

export async function addBoard(board: InsertBoard) {
        if (!board.account_id || board.name.length == 0 || board.color.length == 0) {
                return;
        }
        const newBoard = await Globals.supabase.insertBoard(board);
        const owned = boardElements.boardList.owned;

        if (owned.boardDiv.children.length == 0) {
                setStateClass([owned.boardDiv], [owned.noBoards], "shown");
        }

        boardElements.boardList.owned.boardDiv.appendChild(createBoardElem(newBoard));
}

export async function fillNotifications() {
        const acc = await getAccount();
        if (!acc) return;

        const notifications = await Globals.supabase.fetchNotifications();

        for (const n of notifications.received) {
                notificationModal.body.appendChild(notificationElem(n));
        }
}

function notificationElem(n: ViewNotification): HTMLDivElement {
        const div = Object.assign(document.createElement("div"), { className: "notification-div" });

        const headDiv = Object.assign(document.createElement("div"), { className: "notification-head-div" });
        const headInfoDiv = Object.assign(document.createElement("div"), { className: "notification-head-info" });
        const dismissBtn = Object.assign(document.createElement("button"), { className: "btn-close notification-dismiss" });
        const username = Object.assign(document.createElement("h5"), { innerText: n.from_acc?.name, className: "notification-name" });
        const img = Object.assign(document.createElement("img"), {
                src: n.from_acc?.avatar_url,
                className: "notification-img",
                referrerPolicy: "no-referrer"
        });
        headInfoDiv.append(img, username);
        headDiv.append(headInfoDiv, dismissBtn);

        const divider = Object.assign(document.createElement("div"), { className: "notification-divider" });

        const bodyDiv = Object.assign(document.createElement("div"), { className: "notification-body" });

        const msgBoardInd = n.message.indexOf("board");
        const msg = `${n.message.substring(0, msgBoardInd)}`
        const pElem = Object.assign(document.createElement("p"), { textContent: msg, className: "notification-message" });
        const boardName = Object.assign(document.createElement("b"), { textContent: n.message.substring(msgBoardInd) })
        pElem.appendChild(boardName);


        const buttonsDiv = Object.assign(document.createElement("div"), { className: "notifications-buttons-div" });
        const acceptBtn = Object.assign(document.createElement("button"), {
                type: "button",
                className: "notification-accept-btn",
                innerText: "Accept",
        });
        const declineBtn = Object.assign(document.createElement("button"), {
                type: "button",
                className: "notification-decline-btn",
                innerText: "Decline",
        });

        acceptBtn.addEventListener("click", async () => {
                const boardId = await setNotificationState("accepted");
                const board = await Globals.supabase.fetchBoard(boardId!);
                boardElements.boardList.other.boardDiv.appendChild(createBoardElem(board));
        });
        declineBtn.addEventListener("click", () => setNotificationState("declined"));
        dismissBtn.addEventListener("click", () => setNotificationState("dismissed"));

        async function setNotificationState(state: "accepted" | "declined" | "dismissed"): Promise<number | undefined> {
                const board = await Globals.supabase.notificationResponse(n.id, state);
                div.remove();
                return board;
        }

        buttonsDiv.append(acceptBtn, declineBtn);
        bodyDiv.append(pElem, buttonsDiv);
        div.append(headDiv, divider, bodyDiv);
        return div;
}


export function updateColor(color: string) {
        addBoardModal.colorPicker.value = color;
        addBoardModal.hexInput.value = color.toUpperCase();

        addBoardModal.presetButtons.forEach(btn => {
                if (btn.dataset.color!.toUpperCase() === color.toUpperCase()) {
                        btn.classList.add('active');
                } else {
                        btn.classList.remove('active');
                }
        });
}
