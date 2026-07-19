import { supabase } from "@/core/api/supabase";
import { HTML } from "./html";
import type { Board } from "./types";
import { BoardStore } from "../board-state";

export function initScrollObserver() {
        const updateFade = () => {
                const canScroll = HTML.container.scrollWidth > HTML.container.clientWidth;
                const isAtEnd = Math.abs(HTML.container.scrollLeft) + HTML.container.clientWidth >= HTML.container.scrollWidth - 10;

                if (!canScroll || isAtEnd) {
                        HTML.container.classList.add('is-at-end');
                } else {
                        HTML.container.classList.remove('is-at-end');
                }
        };

        updateFade();

        if (BoardStore.isInitialized) return;

        HTML.container.addEventListener('scroll', updateFade, { passive: true });
        window.addEventListener('resize', updateFade);
}

export function fetchBoard(boardId: string): Promise<Board> {
        return supabase.fetchBoard(boardId);
}

export async function updateBoard(newName: string, color: string) {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Board ID not set");

        BoardStore.setBoardTitle(newName);
        BoardStore.setBoardColor(color);

        return supabase.updateBoard(boardId, newName, color);
}

export async function deleteBoard() {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Board ID not set");

        const acc = await supabase.getAccount();
        if (!acc) throw new Error("Not logged in");

        await supabase.deleteBoard(boardId)

        const collaborators = BoardStore.collaborators.values();
        for (const collaborator of collaborators) {
                if (collaborator.account_id == acc.id) continue;
                supabase.kickCollaborator(collaborator.account_id, boardId);
        }

}

export async function leaveBoard() {
        return supabase.leaveBoard();
}
