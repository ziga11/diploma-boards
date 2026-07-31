import type { Board } from "./types";
import { PermissionId } from "@/core/types/auth";

interface WorkspaceState {
        isInitialized: boolean;
        board?: Board
        permissionId?: PermissionId
}

const state: WorkspaceState = {
        isInitialized: false,
};

export const WorkspaceState = {
        isInitialized() { return state.isInitialized; },

        setInitalized() { state.isInitialized = true; },

        setBoard(board: Board) {
                state.board = board;
        },

        getBoard(): Board | null {
                return state.board ?? null;
        },

        getBoardId(): string | null {
                return state.board?.id ?? null;
        },

        setPermissionId(permissionId: PermissionId): void {
                if (!state.board) return;
                state.board.permission_id = permissionId;
        },

        getPermissionId(): PermissionId | null {
                return state.board?.permission_id ?? null;
        },

        setDeleted(deleted: boolean): void {
                if (!state.board) return;
                state.board.deleted = deleted;
        },

        clear() {
                state.board = undefined;
        }
};
