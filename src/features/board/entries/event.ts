import { HTML } from "./html";
import { appendEntryRow, applyPermissionRestrictions, changeAllEntryChecks, changeFieldEntries, clearEntries, clearListedEntries, createFieldEntries, getCheckedEntryRows, getEntryRowsByIndices, getSelectedRows, removeFieldEntries, setEntryRowVisibility, setEntryVisibility, setValueToEntriesById, swapEntriesDOM, swapEntriesVisually, togglePin, updateFieldEntries } from "./ui/index";
import { btnPressDB, } from "./logic/api";
import { entryEvents } from "./custom-events";
import { EntryWizard } from "./wizard";
import { handleEntryCheckChange, onEntryChange, onEntrySearchChange, onStatusOptionSelected, setupStatusDropdown, updateTextEntry } from "./logic/entry-events";
import { copyEntryRows, createNewEmptyRow, removeRowsByElems, removeRowsByIndices } from "./logic/entry-actions";
import { setfieldEntriesIndex } from "./logic/entry-layout";

export function initEntryEvents() {
        HTML.entriesContainer.addEventListener("click", async (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] === "entry-status" && (elem instanceof HTMLDivElement)) {
                        setupStatusDropdown(elem);
                }
                else if (elem.className === "btn-entry") {
                        btnPressDB(elem.dataset.entryId)
                }
                else if (elem.className === "entry-check") {
                        window.dispatchEvent(entryEvents.checkChange(elem as HTMLInputElement));
                }
                else if (elem.className === "pin-div") {
                        const entrySet = elem.closest(".entry-set") as HTMLDivElement;
                        togglePin(entrySet);
                }
        });

        HTML.entriesContainer.addEventListener("focusin", (e: FocusEvent) => {
                const elem = e.target as HTMLInputElement;
                if (elem.classList[0] != "entry") return;

                EntryWizard.setDraft({ oldEntryValue: elem.value })
        });

        HTML.entriesContainer.addEventListener("focusout", (e: FocusEvent) => {
                const elem = e.target as HTMLInputElement;
                if (elem.classList[0] != "entry") return;

                updateTextEntry(elem);
        })

        HTML.entriesContainer.addEventListener("input", (e: Event) => {
                const elem = e.target as HTMLInputElement;

                onEntryChange(elem.dataset.entryId, elem.value);
        })

        HTML.dropdown.optionsContainer.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLDivElement;

                onStatusOptionSelected(elem);
        });

        HTML.search.addEventListener("input", onEntrySearchChange);

        window.addEventListener(entryEvents.applyPermissionRestrictions.type, (e: Event) => {
                const { isMember } = (e as ReturnType<typeof entryEvents.applyPermissionRestrictions>).detail;

                applyPermissionRestrictions(isMember);
        })

        window.addEventListener(entryEvents.entryCheckChangeAll.type, (e: Event) => {
                const checked = (e as ReturnType<typeof entryEvents.entryCheckChangeAll>).detail;

                changeAllEntryChecks(checked);
        });

        window.addEventListener(entryEvents.realtimeEntryChange.type, (e: Event) => {
                const { entry_id, value, option_id } = (e as ReturnType<typeof entryEvents.realtimeEntryChange>).detail;

                setValueToEntriesById(entry_id, value, option_id);
        });

        window.addEventListener(entryEvents.entryChangeFieldValues.type, (e: Event) => {
                const { field_id, old_value, value } = (e as ReturnType<typeof entryEvents.entryChangeFieldValues>).detail;

                changeFieldEntries({ fieldId: field_id, oldValue: old_value, value });
        });

        window.addEventListener(entryEvents.checkChange.type, (e: Event) => {
                const checkElem = (e as ReturnType<typeof entryEvents.checkChange>).detail;

                handleEntryCheckChange(checkElem)
        });

        window.addEventListener(entryEvents.visuallySwap.type, (e: Event) => {
                const { field1_id, field2_id } = (e as ReturnType<typeof entryEvents.visuallySwap>).detail;

                swapEntriesVisually({ field1_id, field2_id });
        });

        window.addEventListener(entryEvents.swapDOM.type, (e: Event) => {
                const { field1_id, field2_id, styleSwap } = (e as ReturnType<typeof entryEvents.swapDOM>).detail;

                swapEntriesDOM({ field1_id, field2_id, styleSwap });
        });

        window.addEventListener(entryEvents.removeRowsByIndices.type, (e: Event) => {
                const { indices } = (e as ReturnType<typeof entryEvents.removeRowsByIndices>).detail;
                removeRowsByIndices(indices);
        });

        window.addEventListener(entryEvents.removeSelectedRows.type, () => {
                const selectedRows = getSelectedRows();

                removeRowsByElems(selectedRows);
        });

        window.addEventListener(entryEvents.removeEntriesUi.type, (e: Event) => {
                const { fieldId, indices } = (e as ReturnType<typeof entryEvents.removeEntriesUi>).detail;

                if (fieldId != undefined) {
                        removeFieldEntries(fieldId);
                } else if (indices != undefined) {
                        removeRowsByIndices(indices);
                }
        });

        window.addEventListener(entryEvents.setRowsVisibility.type, (e: Event) => {
                const { indices, visible } = (e as ReturnType<typeof entryEvents.setRowsVisibility>).detail;

                const rows = getEntryRowsByIndices(indices);
                rows.forEach(row => setEntryRowVisibility({ row, visible }));
        });

        window.addEventListener(entryEvents.setFieldEntriesVisibility.type, (e: Event) => {
                const { fieldId, visible } = (e as ReturnType<typeof entryEvents.setFieldEntriesVisibility>).detail;

                const entries = HTML.entriesList.querySelectorAll(`.entry[data-field-id="${fieldId}"]`)

                setEntryVisibility(Array.from(entries), visible);
        });

        window.addEventListener(entryEvents.btnTriggered.type, (e: Event) => {
                const btnDiv = (e as ReturnType<typeof entryEvents.btnTriggered>).detail;

                const entryId = btnDiv.dataset.entryId;
                if (!entryId) return;

                btnPressDB(entryId)
        });

        window.addEventListener(entryEvents.clearEntries.type, () => {
                clearEntries();
        });

        window.addEventListener(entryEvents.createFieldEntries.type, (e: Event) => {
                const data = (e as ReturnType<typeof entryEvents.createFieldEntries>).detail;

                createFieldEntries(data.field, data.entryIds);
        });

        window.addEventListener(entryEvents.removeFieldEntries.type, (e: Event) => {
                const { fieldId } = (e as ReturnType<typeof entryEvents.removeFieldEntries>).detail;

                removeFieldEntries(fieldId);
        });

        window.addEventListener(entryEvents.setFieldIndexToEntries.type, (e: Event) => {
                const { fieldId, index } = (e as ReturnType<typeof entryEvents.setFieldIndexToEntries>).detail;

                setfieldEntriesIndex(fieldId, index);
        });

        window.addEventListener(entryEvents.updateFieldEntries.type, (e: Event) => {
                const data = (e as ReturnType<typeof entryEvents.updateFieldEntries>).detail;

                updateFieldEntries(data.entries, data.index);
        });

        window.addEventListener(entryEvents.sortChange.type, () => EntryWizard.resetScrollLoader(clearListedEntries));

        window.addEventListener(entryEvents.newRow.type, () => createNewEmptyRow());

        window.addEventListener(entryEvents.realtimeNewRows.type, (e: Event) => {
                const entryRowsArr = (e as ReturnType<typeof entryEvents.realtimeNewRows>).detail;

                entryRowsArr.map(e => appendEntryRow(e.entries));
        });

        window.addEventListener(entryEvents.copySelectedRows.type, () => {
                const rows = getCheckedEntryRows();
                copyEntryRows(rows);
        });
}
