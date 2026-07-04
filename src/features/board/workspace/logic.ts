import { supabase } from "@/core/api/supabase";
import { HTML } from "./html";
import type { Board } from "./types";
import { BoardStore } from "../board-state";
import { getAccount } from "@/core/utils/utils";

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

export async function deleteBoard() {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Board ID not set");

        const acc = await getAccount();
        if (!acc) throw new Error("Not logged in");

        const collaborators = BoardStore.collaborators.values();
        for (const collaborator of collaborators) {
                if (collaborator.account_id == acc.id) continue;
                supabase.kickCollaborator(collaborator.account_id, boardId);
        }

        return supabase.deleteBoard(boardId)
}

export async function leaveBoard() {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Board ID not set");

        const acc = await getAccount();
        if (!acc) throw new Error("Account was not set");

        return supabase.kickCollaborator(acc.id!, boardId);
}
