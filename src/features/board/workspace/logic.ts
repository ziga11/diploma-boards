import { supabase } from "@/core/api/supabase";
import { HTML } from "./html";
import type { Board } from "./types";
import { WorkspaceState } from "./state";
import { MasterRegistry } from "@/features/board/master-registry";
import { usersToken } from "@/features/board/user-management/registry";
import { closeDeleteModal, closeEditBoardModal, closeLeaveModal, openEditBoardModal, setEditBoardValues } from "./view";
import { dashboardEvents } from "@/features/dashboard/workspace/custom-events";
import { navigate } from "@/core/utils/router";
import { showToast } from "@/core/utils/dom";
import { workspaceToken } from "./registry";
import { topToolbarEvents } from "@/features/board/top-toolbar/custom-events";
import { workspaceEvents } from "./custom-events";

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

        if (WorkspaceState.isInitialized()) return;

        HTML.container.addEventListener('scroll', updateFade, { passive: true });
        window.addEventListener('resize', updateFade);
}

export function onEditBoardBtnPress() {
        const board = MasterRegistry.get(workspaceToken).getBoard();
        if (!board) throw new Error("Board not set");
        setEditBoardValues(board.name!, board.color!);

        openEditBoardModal();
}

export async function onDeleteBoardBtnPress() {
        const id = WorkspaceState.getBoardId();
        if (!id) return;

        closeDeleteModal();
        await navigate("/dashboard");
        window.dispatchEvent(workspaceEvents.clearAll());
        window.dispatchEvent(dashboardEvents.moveBoard({ id, group: "deleted" }))

        deleteBoardDB()
                .catch(err => {
                        window.dispatchEvent(dashboardEvents.moveBoard({ id, group: "owned" }))
                        showToast(`Failed to delete board: ${err}`, "error")
                });
}

export async function onLeaveBoardBtnPress() {
        const id = WorkspaceState.getBoardId();
        if (!id) return;

        closeLeaveModal();
        await navigate("/dashboard");
        window.dispatchEvent(workspaceEvents.clearAll());
        window.dispatchEvent(dashboardEvents.setBoardClass({ id, state: "hidden" }))

        leaveBoardDB()
                .then(_ => window.dispatchEvent(dashboardEvents.removeBoard(id)))
                .catch(err => {
                        window.dispatchEvent(dashboardEvents.removeBoardClass({ id, state: "hidden" }))
                        showToast(`Failed to delete board: ${err}`, "error")
                });
}

export function onUpdateBoardBtnPress() {
        const name = HTML.editBoard.nameInput.value;
        const color = HTML.editBoard.colorPicker.value;

        const activeBoard = MasterRegistry.get(workspaceToken).getBoard();

        if (name == activeBoard?.name && color.toUpperCase() == activeBoard.color?.toUpperCase()) {
                return;
        }

        window.dispatchEvent(topToolbarEvents.setBorderColorAndName({ color, name }));

        updateBoardDB(name, color);
        closeEditBoardModal();
}

export function fetchBoardDB(boardId: string): Promise<Board> {
        return supabase.fetchBoard(boardId);
}

export async function updateBoardDB(newName: string, color: string) {
        const board = WorkspaceState.getBoard();
        if (!board?.id) throw new Error("Board ID not set");

        board.name = newName;
        board.color = color;
        WorkspaceState.setBoard(board);

        return supabase.updateBoard(board.id, newName, color);
}

export async function deleteBoardDB() {
        const acc = await supabase.getAccount();
        if (!acc) throw new Error("Not logged in");

        const boardId = WorkspaceState.getBoardId();
        if (!boardId) throw new Error("boardId not set");

        await supabase.deleteBoard(boardId)

        const collaborators = MasterRegistry.get(usersToken).getCollaborators();
        collaborators.forEach(c => {
                if (c.account_id != acc.id) {
                        supabase.kickCollaborator(boardId, c.account_id);
                        MasterRegistry.get(usersToken).removeCollaborator(c.account_id);
                }
        });

        const invCollaborators = MasterRegistry.get(usersToken).getInvitedCollaborators();
        invCollaborators.forEach(c => {
                if (c.to_email != acc.email) {
                        supabase.removeInvitation(boardId, c.to_email);
                        MasterRegistry.get(usersToken).removeInvitedCollaborator(c.to_email);
                }
        });
}

export async function leaveBoardDB() {
        const id = WorkspaceState.getBoardId();
        if (!id) throw new Error("boardId not set");

        return supabase.leaveBoard(id);
}
