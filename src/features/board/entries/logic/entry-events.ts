import { MasterRegistry } from "@/features/board/master-registry";
import { fieldsToken } from "@/features/board/fields/registry";
import { HTML } from "../html";
import { EntryWizard } from "../wizard";
import { EntryState } from "../state";
import { updateEntryDB } from "./api";
import { showToast, closeDialog } from "@/core/utils/dom";
import { fieldEvents } from "@/features/board/fields/custom-events";
import { bottomToolbarEvents } from "@/features/board/bottom-toolbar/custom-events";
import { setValueToEntries } from "./entry-layout";
import { clearListedEntries, getCheckboxInfo, getCheckedCount, setDropdownOptions, showStatusDropdown, syncMirrorCheckbox } from "../ui";

export function handleEntryCheckChange(check: HTMLInputElement) {
        const info = getCheckboxInfo(check);

        if (info.index && (info.isPinnedContainer || info.isPinnedClass)) {
                syncMirrorCheckbox(info.index, info.checked, info.isPinnedContainer);
        }

        const checkCount = getCheckedCount();
        const visibleToolbar = checkCount > 0;
        const allFieldsChecked = EntryState.getRowCount().rendered === checkCount;

        window.dispatchEvent(fieldEvents.checkChange(allFieldsChecked));
        window.dispatchEvent(bottomToolbarEvents.visible({ visible: visibleToolbar, checkedCount: checkCount }));
}

export function setupStatusDropdown(entryElem: HTMLDivElement) {
        const fieldId = entryElem.dataset.fieldId;
        if (!fieldId || ["", "undefined"].includes(fieldId)) {
                console.error("fieldId is not set --> error");
                return;
        }

        const field = MasterRegistry.get(fieldsToken).getFieldById(fieldId)!;
        HTML.dropdown.menu.dataset.entryId = entryElem.dataset.entryId;

        const entryRect = entryElem.getBoundingClientRect();
        showStatusDropdown(entryRect.left, entryRect.bottom + 2);
        setDropdownOptions(Object.values(field.options!));
}

export function onStatusOptionSelected(elem: HTMLDivElement) {
        closeDialog(HTML.dropdown.menu);
        if (elem.className !== "status-dropdown-option") return;

        const entryId = HTML.dropdown.menu.dataset.entryId;
        const optionId = elem.dataset.id;
        const entryElems = HTML.entriesList.querySelectorAll(`[data-entry-id="${entryId}"]`) as NodeListOf<HTMLDivElement>;

        const value = elem.dataset.value ?? "";
        const dbValue = entryElems[0]?.dataset.dbValue ?? "";
        if (value === dbValue) return;

        setValueToEntries(entryElems, value);
        updateEntryDB(entryId!, value, optionId)
                .then(() => entryElems.forEach(e => (e.dataset.dbValue = value)))
                .catch(err => {
                        setValueToEntries(entryElems, dbValue);
                        showToast(`Failed to set the input value ${err}`, "error");
                });
}

export async function updateTextEntry(input: HTMLInputElement) {
        const value = input.value;
        if (EntryWizard.getOldEntryValue() === value) return;

        const entryId = input.dataset.entryId;
        await updateEntryDB(entryId!, value);
}

export function onEntrySearchChange() {
        const value = HTML.search.value;

        EntryWizard.clearDebounceTimer();
        EntryWizard.setDraft({
                debounceTimer: setTimeout(async () => {
                        EntryState.setSearchQuery(value);
                        EntryWizard.resetScrollLoader(clearListedEntries);
                }, value.length < 2 ? 500 : 300),
        });
}

export function onEntryChange(entryId?: string, value?: string) {
        if (!entryId) return;
        const entryElems = HTML.entriesContainer.querySelectorAll(`.entry[data-entry-id="${entryId}"]`) as NodeListOf<HTMLElement>;

        if (entryElems.length > 1) {
                setValueToEntries(entryElems, value!);
        }
}
