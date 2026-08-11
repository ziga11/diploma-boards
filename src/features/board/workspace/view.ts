import { closeDialog } from "@/core/utils/dom";
import { HTML } from "./html";
import { WorkspaceState } from "./state";

export function hexChange(value: string) {
        if (!value.startsWith('#')) {
                value = '#' + value;
        }
        if (/^#[0-9A-F]{6}$/i.test(value)) {
                updateColor(value);
        }
}

export function updateColor(color: string) {
        HTML.editBoard.colorPicker.value = color;
        HTML.editBoard.hexInput.value = color.toUpperCase();

        HTML.editBoard.presetColors.forEach(btn => {
                const sameColor = btn.dataset.color!.toUpperCase() === color.toUpperCase();
                if (sameColor) {
                        btn.classList.add('active');
                } else {
                        btn.classList.remove('active');
                }
        });
}

export function setBoardSettings() {
        const board = WorkspaceState.getBoard();
        if (!board) return;

        setBoardTitle(board.name!);
        applyPermissionRestrictions(board.deleted ?? false);
}

export function applyPermissionRestrictions(deleted: boolean) {
        HTML.container.classList.toggle("disabled", deleted);
}

export function openEditBoardModal() {
        HTML.editBoard.modal.showModal();
}

export function closeEditBoardModal() {
        closeDialog(HTML.editBoard.modal);
}

export function openDeleteBoardModal() {
        HTML.delete.modal.showModal();
}

export function closeDeleteModal() {
        HTML.delete.modal.close();
}

export function openLeaveBoardModal() {
        HTML.delete.modal.showModal();
}

export function closeLeaveModal() {
        HTML.leave.modal.close();
}

export function setBoardTitle(newTitle: string) {
        HTML.tabTitleTag.innerText = `Loom - ${newTitle}`;
        HTML.titleSpan.innerText = newTitle;
}

export function setEditBoardValues(name: string, color: string) {
        HTML.editBoard.colorPicker.value = color;
        HTML.editBoard.hexInput.value = color;

        HTML.editBoard.nameInput.value = name;

        HTML.editBoard.presetColors.forEach(c => {
                c.classList.toggle("active", c.dataset.color?.toLowerCase() == color.toLowerCase())
        });
}
