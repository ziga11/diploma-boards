import { Globals } from "../globals";
import type { Board } from "../types";
import { boardElements, modalElements } from "./html";

export function initToolbar() {
        const img = document.createElement("img");
        img.src = Globals.account!.avatar_url!;
        img.width = 80;
        img.height = 80;
        img.style.borderRadius = '40%';
        img.referrerPolicy = 'no-referrer';

        boardElements.profilePic.insertBefore(img, boardElements.profilePic.children[0]);
        boardElements.profilePic.addEventListener("click", async () => {
                await Globals.supabase.signOut();
                window.location.href = "login.html";
        });

        boardElements.userBoards.innerText = `${Globals.account?.name} - Board Dashboard`;
}

export async function populateBoards() {
        const boards = await Globals.supabase.fetchBoards(Globals.account!.id!);

        for (const board of boards) {
                boardElements.boardList.appendChild(createBoard(board));
        }
}

function createBoard(board: Board): HTMLDivElement {
        const div = document.createElement('div');
        div.className = "board-entry";
        div.innerText = board.name;
        div.style.borderLeftColor = board.color;
        div.setAttribute("boardId", `${board.id}`);
        div.addEventListener("click", () => {
                window.location.href = `/board.html?boardId=${board.id}&title=${board.name}`;
        });

        return div;
}

export function initColorPick() {
        updateColor('#ff4757');

        modalElements.colorPicker.addEventListener('input', () => {
                updateColor(modalElements.colorPicker.value);
        });

        modalElements.hexInput.addEventListener('input', hexInputChange);

        modalElements.presetButtons.forEach(button => {
                button.addEventListener('click', function() {
                        updateColor(this.dataset.color!);
                });
        });

        modalElements.addBoard.addEventListener("click", () => addBoard({
                account_id: Globals.account?.id,
                color: modalElements.hexInput.value,
                name: modalElements.boardName.value,
        } as Board));
}

async function addBoard(board: Board) {
        if (!board.account_id || board.name.length == 0 || board.color.length == 0) {
                return;
        }
        const newBoard = await Globals.supabase.insertBoard(board);
        boardElements.boardList.appendChild(createBoard(newBoard));
}

function hexInputChange() {
        let value = modalElements.hexInput.value;

        if (!value.startsWith('#')) {
                value = '#' + value;
        }
        if (/^#[0-9A-F]{6}$/i.test(value)) {
                updateColor(value);
        }
}

function updateColor(color: string) {
        modalElements.colorPicker.value = color;
        modalElements.hexInput.value = color.toUpperCase();

        modalElements.presetButtons.forEach(btn => {
                if (btn.dataset.color!.toUpperCase() === color.toUpperCase()) {
                        btn.classList.add('active');
                } else {
                        btn.classList.remove('active');
                }
        });
}
