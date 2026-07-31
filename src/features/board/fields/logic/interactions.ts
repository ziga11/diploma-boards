import { HTML } from "../html";
import { FieldsState } from "../state";
import { applyFieldWidthStyles, closeFieldMenu, showEditFieldMenu, showNewFieldMenu, updateLiveFieldWidth } from "../ui/field";
import { switchIndexInDB } from "./api";
import { FieldsWizard } from "../wizard-state";
import { PermissionId } from "@/core/types/auth";
import { showToast } from "@/core/utils/dom";
import { entryEvents } from "@/features/board/entries/custom-events";
import { MasterRegistry } from "@/features/board/master-registry";
import { workspaceToken } from "@/features/board/workspace/registry";


export async function showNewFieldDropdown() {
        const addFieldBtn = HTML.newFieldBtn;
        const btnRect = addFieldBtn.getBoundingClientRect();

        let left: number;
        if (btnRect.right < window.innerWidth - 200) {
                left = btnRect.right + 10;
        } else {
                const fieldMenuWidth = HTML.newFieldMenu.offsetWidth;
                left = btnRect.left - fieldMenuWidth - 10;
        }

        const top = btnRect.top + 10;
        showNewFieldMenu(left, top);
}

export async function showEditFieldDropdown(fieldDiv: HTMLDivElement) {
        const fieldId = fieldDiv.dataset.fieldId;
        if (!fieldId) return;

        const fieldRect = fieldDiv.getBoundingClientRect();
        HTML.fieldDropdown.div.dataset.fieldId = fieldId;

        const fieldSorted = FieldsState.getSortingInfo()?.fieldId === fieldId;
        const isAscending = FieldsState.getSortingInfo()?.ascending;

        const left = fieldRect.left;
        const top = fieldRect.bottom + 2;

        showEditFieldMenu(left, top, (fieldSorted && isAscending) ?? false, (fieldSorted && !isAscending) ?? false);
}

export function initFieldWidths(boardId: string): void {
        const rawWidths = localStorage.getItem(`board_${boardId}_column_widths`);
        if (!rawWidths) return;

        try {
                const widths = JSON.parse(rawWidths) as Record<string, number>;
                applyFieldWidthStyles(widths);
        } catch (err) {
                console.error("Failed to parse cached column widths", err);
        }
}

export function addDynamicFieldWidthToStorage(fieldId: string, width: number) {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        let widths = localStorage.getItem(`board_${boardId}_column_widths`);
        const widthRecords = (!widths ? {} : JSON.parse(widths)) as Record<string, number>;

        widthRecords[fieldId] = width;
        localStorage.setItem(`board_${boardId}_column_widths`, JSON.stringify(widthRecords));
}

export function onFieldDragStart(elem: HTMLDivElement) {
        const permissionId = MasterRegistry.get(workspaceToken).getBoard()?.permission_id;
        if (permissionId === PermissionId.Member) return;

        FieldsWizard.setDraft({
                drag: {
                        leeway: 0,
                        field1: elem,
                        field1Rect: elem.getBoundingClientRect(),
                        isDragging: true
                }
        });

        document.addEventListener("mousemove", fieldDrag);
}

export function fieldDrag(e: MouseEvent) {
        const dragProps = FieldsWizard.getDragState();

        if (!dragProps.field1 || !dragProps.field1Rect) return;
        if (e.x >= dragProps.field1Rect.left - dragProps.leeway && e.x <= dragProps.field1Rect.right + dragProps.leeway) return;

        const increase = e.x > dragProps.field1Rect.right;
        const field1 = dragProps.field1;
        const field2 = (increase ? field1.nextElementSibling : field1.previousElementSibling) as HTMLDivElement;

        if (field2?.className !== "field-div") return;

        swapField({ field1, field2 });

        const f1Rect = dragProps.field1.getBoundingClientRect();
        dragProps.field1Rect = f1Rect;

        if (dragProps.field2 !== field2) {
                const f2Rect = field2.getBoundingClientRect();
                if (f2Rect.width > f1Rect.width) {
                        dragProps.leeway = f2Rect.width - dragProps.field1Rect.width;
                }
        }

        dragProps.field2 = field2;
        window.dispatchEvent(entryEvents.visuallySwap({ field1_id: field1.dataset.fieldId!, field2_id: field2.dataset.fieldId! }));
}

export function swapField({ field1, field2 }: { field1: HTMLDivElement; field2: HTMLDivElement }) {
        const [o1, o2] = [Number(field1.dataset.order), Number(field2.dataset.order)];

        if (o1 < o2) {
                field1.before(field2);
        } else {
                field1.after(field2);
        }

        field1.dataset.order = `${o2}`;
        field2.dataset.order = `${o1}`;
}

export function onFieldSwapEnd() {
        const swapProps = FieldsWizard.getDragState();
        const permissionId = MasterRegistry.get(workspaceToken).getBoard()?.permission_id;
        if (!swapProps.isDragging || permissionId === PermissionId.Member) return;

        const fieldId1 = swapProps.field1?.dataset.fieldId;
        const fieldId2 = swapProps.field2?.dataset.fieldId;

        if ([fieldId1, fieldId2].includes(undefined) || fieldId1 === fieldId2) return;

        switchIndexInDB(fieldId1!, fieldId2!)
                .catch(err => showToast(`Error switching indices ${err}`, "error"));

        window.dispatchEvent(entryEvents.swapDOM({ field1_id: fieldId1!, field2_id: fieldId2!, styleSwap: false }));
        FieldsWizard.reset();
}

/*INFO: Resizing */
export function onFieldResizeStart(fieldDiv: HTMLDivElement) {
        FieldsWizard.setDraft({
                resize: {
                        field: fieldDiv,
                        startRect: fieldDiv.getBoundingClientRect(),
                        isResizing: true
                }
        });

        document.addEventListener("mousemove", resizeField);
}

export function resizeField(e: MouseEvent) {
        const resizeProps = FieldsWizard.getResizeState();
        if (!resizeProps.field || !resizeProps.startRect) return;

        const startWidth = resizeProps.startRect.width;
        const deltaX = e.clientX - resizeProps.startRect.right;
        const newWidth = Math.max(50, startWidth + deltaX);
        resizeProps.newWidth = newWidth;

        const fieldId = resizeProps.field.dataset.fieldId;
        if (fieldId) {
                updateLiveFieldWidth(fieldId, newWidth);
        }
}

export function onFieldResizeEnd() {
        const resizeProps = FieldsWizard.getResizeState();
        if (!resizeProps.isResizing) return;

        const fieldId = resizeProps.field!.dataset.fieldId!;
        const newWidth = resizeProps.newWidth!;

        updateLiveFieldWidth(fieldId, newWidth);
        FieldsWizard.reset();
}

export function onSortingOptionPress(fieldId: string, ascending: boolean) {
        const sortInfo = FieldsState.getSortingInfo();

        if (sortInfo?.fieldId === fieldId && sortInfo.ascending === ascending) {
                FieldsState.removeSortingInfo();
                clearSortLocalData();
        } else {
                FieldsState.setSortingInfo(fieldId, ascending);
                setSortLocalData(fieldId, ascending);
        }

        onSortChange();
        closeFieldMenu();
}

async function onSortChange() {
        window.dispatchEvent(entryEvents.sortChange());
}

function clearSortLocalData() {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        localStorage.removeItem(`${boardId}-sort-field-id`);
}

function setSortLocalData(fieldId: string, ascending: boolean) {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) return;

        localStorage.setItem(`${boardId}-sort-field-id`, fieldId);
        localStorage.setItem(`${boardId}-sort-ascending`, ascending ? "t" : "f");
}
