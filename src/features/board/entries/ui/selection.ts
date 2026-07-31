import { HTML } from "../html";
import { bottomToolbarEvents } from "@/features/board/bottom-toolbar/custom-events";
import type { CheckboxInfo } from "../render-types";

export function getCheckboxInfo(check: HTMLInputElement): CheckboxInfo {
        const entrySet = check.closest(".entry-set") as HTMLDivElement | null;
        return {
                index: entrySet?.dataset.index,
                isPinnedContainer: entrySet?.parentElement?.className === "pinned-entry-rows",
                isPinnedClass: entrySet?.classList.contains("pinned") ?? false,
                checked: check.checked,
        };
}

export function syncMirrorCheckbox(index: string, checked: boolean, isPinnedContainer: boolean): void {
        const targetContainer = isPinnedContainer ? HTML.entriesList : HTML.pinnedEntriesList;
        const mirrorCheck = targetContainer.querySelector<HTMLInputElement>(`.entry-set[data-index="${index}"] .entry-check`);
        if (mirrorCheck) {
                mirrorCheck.checked = checked;
        }
}

export function getCheckedCount(): number {
        return HTML.entriesList.querySelectorAll(".entry-check:checked").length;
}

export function getCheckedCheckboxes(): NodeListOf<HTMLInputElement> {
        return HTML.entriesList.querySelectorAll(".entry-check:checked");
}

export function getCheckedEntryRows(): NodeListOf<HTMLDivElement> {
        return HTML.entriesList.querySelectorAll(".entry-set:has(.entry-check:checked)") as NodeListOf<HTMLDivElement>;
}

export function getSelectedRows(): HTMLDivElement[] {
        const selectedChecks = getCheckedCheckboxes();
        return Array.from(selectedChecks).map(e => e.closest(".entry-set") as HTMLDivElement);
}

export function changeAllEntryChecks(checked: boolean): void {
        const inps = Array.from(HTML.entryChecks);
        inps.forEach(inp => (inp.checked = checked));

        window.dispatchEvent(bottomToolbarEvents.visible({ visible: checked, checkedCount: inps.length }));
}

export function applyPermissionRestrictions(isMember: boolean): void {
        if (isMember) changeAllEntryChecks(false);

        const toDisable = HTML.entriesContainer.querySelectorAll(`.entry-check-div, .entries-div`) as NodeListOf<HTMLElement>;
        toDisable.forEach(e => e.classList.toggle("disabled", isMember));
}
