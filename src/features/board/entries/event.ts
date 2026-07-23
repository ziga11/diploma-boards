import { closeDialog, setStateClass, showToast } from "@/core/utils/dom";
import { HTML } from "./html";
import { changeAllEntryChecks, changeFieldEntries, createEntryCopiesFromEntrySet, createEntryRow, createFieldEntries, entryCheckChange, setEntryRows, setupStatusDropdown, swapEntriesDOM, swapEntriesVisually, updateFieldEntries } from "./view";
import { updateEntry, deleteRows, insertEntryRows, insertEmptyEntryRows, btnPress, } from "./logic";
import { BoardState } from "../board-state";
import { entryEvents } from "./custom-events";
import { changeDeepestValue } from "./view-utils";
import type { Entry } from "./types";
import { PermissionId } from "@/core/types/auth";

let debounceTimer: any;

let prevEntryVal: string | undefined;
let entryElems: undefined | NodeListOf<HTMLElement>;

export function initEntryEvents() {
        if (BoardState.isInitialized) return;

        HTML.entriesContainer.addEventListener("click", async (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] === "entry-status" && (elem instanceof HTMLDivElement)) {
                        window.dispatchEvent(entryEvents.statusClicked(elem));
                }
                else if (elem.className === "btn-entry") {
                        window.dispatchEvent(entryEvents.btnTriggered(elem.parentElement as HTMLDivElement));
                }
                else if (elem.className === "entry-check") {
                        window.dispatchEvent(entryEvents.checkChange(elem as HTMLInputElement));
                }
                else if (elem.className === "pin-div") {
                        const entrySet = elem.closest(".entry-set") as HTMLDivElement;
                        window.dispatchEvent(entryEvents.togglePin(entrySet));
                }
        });

        HTML.entriesContainer.addEventListener("focusin", (e: FocusEvent) => {
                const elem = e.target as HTMLElement;
                if (elem.classList[0] != "entry") return;

                prevEntryVal = (elem as HTMLInputElement).value;
        });

        HTML.entriesContainer.addEventListener("focusout", (e: FocusEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] != "entry") return;

                const value = (elem as HTMLInputElement).value;
                if (prevEntryVal == value) return;

                const entryId = elem.dataset.entryId;
                updateEntry(entryId!, value);

                entryElems = undefined;
        })

        HTML.entriesContainer.addEventListener("input", (e: Event) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] != "entry") return;

                const id = elem.dataset.entryId;
                const value = (elem as HTMLInputElement).value;
                if (!entryElems) {
                        entryElems = HTML.entriesContainer.querySelectorAll(`.entry[data-entry-id="${id}"]`) as NodeListOf<HTMLElement>;
                }

                if (entryElems.length > 1) {
                        for (const elem of entryElems) changeDeepestValue(elem, value);
                }
        })

        HTML.dropdown.optionsContainer.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLDivElement;

                if (elem.className !== "status-dropdown-option") {
                        closeDialog(HTML.dropdown.menu);
                        return;
                }

                closeDialog(HTML.dropdown.menu);

                const entryId = HTML.dropdown.menu.dataset.entryId;
                const optionId = elem.dataset.id;
                const entryElem = HTML.entriesList.querySelector(`[data-entry-id="${entryId}"]`) as HTMLDivElement;

                const value = elem.dataset.value ?? "";
                if (value == entryElem.dataset.dbValue) return;

                if (entryElem instanceof HTMLInputElement) {
                        entryElem.value = value;
                } else {
                        entryElem.innerText = value;
                }

                updateEntry(entryId!, value, optionId)
                        .then(_ => entryElem.dataset.dbValue = value)
                        .catch(err => {
                                if (entryElem instanceof HTMLInputElement) {
                                        entryElem.value = entryElem.dataset.dbValue ?? "";
                                } else {
                                        entryElem.innerText = entryElem.dataset.dbValue ?? "";
                                }
                                showToast(`Failed to set the input value ${err}`, "error");
                        });

        });

        HTML.search.addEventListener("input", () => {
                const value = HTML.search.value;

                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(async () => {
                        BoardState.setSearchQuery(value)

                        const result = await BoardState.entryFetchGenerator!.next();

                        if (result.done) return;
                        const entries = result.value ?? [];

                        setEntryRows(entries, false);
                }, value.length < 2 ? 500 : 300);
        });

        window.addEventListener(entryEvents.statusClicked.type, (e: Event) => {
                const elem = (e as ReturnType<typeof entryEvents.statusClicked>).detail;

                if (!elem.dataset.fieldId || ["", "undefined"].includes(elem.dataset.fieldId)) {
                        console.error("fieldId is not set --> error");
                        return;
                }

                setupStatusDropdown(elem);
        });

        window.addEventListener(entryEvents.applyPermissionRestrictions.type, () => {
                const isMember = PermissionId.Member == BoardState.permissionId;

                if (isMember) {
                        entryEvents.entryCheckChangeAll(false);
                }

                const toDisable = HTML.entriesContainer.querySelectorAll(`.entry-check-div, .entries-div`) as NodeListOf<HTMLElement>
                toDisable.forEach(e => e.classList.toggle("disabled", isMember));
        })

        window.addEventListener(entryEvents.entryCheckChangeAll.type, (e: Event) => {
                const checked = (e as ReturnType<typeof entryEvents.entryCheckChangeAll>).detail;

                changeAllEntryChecks(checked);
        });

        window.addEventListener(entryEvents.realtimeEntryChange.type, (e: Event) => {
                let { entry_id: entryId, value, option_id: optionId } = (e as ReturnType<typeof entryEvents.realtimeEntryChange>).detail;

                const elems = HTML.entriesContainer.querySelectorAll(`.entry[data-entry-id="${entryId}"]`) as NodeListOf<HTMLDivElement | HTMLInputElement>;

                const fieldId = elems[0].dataset.fieldId;

                if (!elems || !fieldId) return;
                const field = BoardState.getField(fieldId)!;

                if (["status", "button"].includes(field.type!)) {
                        value = field.options![optionId!].value;
                }

                for (const elem of elems) {
                        changeDeepestValue(elem, value!);
                }
        });

        window.addEventListener(entryEvents.entryChangeFieldValues.type, (e: Event) => {
                const { field_id, old_value, value } = (e as ReturnType<typeof entryEvents.entryChangeFieldValues>).detail;

                changeFieldEntries({ fieldId: field_id, oldValue: old_value, value });
        });

        window.addEventListener(entryEvents.checkChange.type, (e: Event) => {
                const checkElem = (e as ReturnType<typeof entryEvents.checkChange>).detail;

                entryCheckChange(checkElem);
        });

        window.addEventListener(entryEvents.visuallySwap.type, (e: Event) => {
                const { field1_id, field2_id } = (e as ReturnType<typeof entryEvents.visuallySwap>).detail;

                swapEntriesVisually({ field1_id, field2_id });
        });

        window.addEventListener(entryEvents.swapDOM.type, (e: Event) => {
                const { field1_id, field2_id, styleSwap } = (e as ReturnType<typeof entryEvents.swapDOM>).detail;

                swapEntriesDOM({ field1_id, field2_id, styleSwap });
        });

        window.addEventListener(entryEvents.removeSelected.type, _ => {
                const entryChecks = HTML.entriesContainer.querySelectorAll(".entry-check:checked") as NodeListOf<HTMLInputElement>;

                const indices: Array<number> = [];
                const entrySets: Array<HTMLDivElement> = [];

                for (const entryCheck of entryChecks) {
                        const entrySet = entryCheck.closest(".entry-set") as HTMLDivElement;

                        if (entrySet.classList.length == 1) {
                                const ind = Number(entrySet.dataset.index);
                                indices.push(ind);
                        }

                        entrySet.style.display = "none";

                        entrySets.push(entrySet);
                }


                deleteRows(indices)
                        .then(_ => {
                                entrySets.forEach(e => e.remove());

                                const renderedRows = BoardState.rowCount.rendered - indices.length;
                                const allRows = BoardState.rowCount.all - indices.length;

                                BoardState.setRowCount({ rendered: renderedRows, all: allRows });
                        })
                        .catch(err => {
                                entrySets.forEach(e => e.style.display = "flex");
                                showToast(`Failed to delete rows: ${err}`, "error");
                        });
        });

        window.addEventListener(entryEvents.realtimeRemoveEntries.type, (e: Event) => {
                const { fieldId, indices } = (e as ReturnType<typeof entryEvents.realtimeRemoveEntries>).detail;

                if (fieldId != undefined) {
                        const fieldSize = BoardState.fields.size;

                        if (fieldSize == 1) {
                                const entrySets = HTML.entriesContainer.querySelectorAll(".entry-set") as NodeListOf<HTMLDivElement>;
                                entrySets.forEach(es => es.remove());
                        }
                        else {
                                const entries = HTML.entriesContainer.querySelectorAll(`[data-field-id="${fieldId}"]`) as NodeListOf<HTMLDivElement>
                                entries.forEach(e => e.remove());
                        }
                }
                else if (indices != undefined) {
                        const selector = indices.map(i => `.entry-set[data-index="${i}"]`).join(", ");

                        const entrySets = HTML.entriesList.querySelectorAll(selector) as NodeListOf<HTMLDivElement>;
                        entrySets.forEach(es => es.remove());

                        const renderedRows = BoardState.rowCount.rendered - indices.length;
                        const allRows = BoardState.rowCount.all - indices.length;

                        BoardState.setRowCount({ rendered: renderedRows, all: allRows })
                }
        });

        window.addEventListener(entryEvents.setEntryVisibility.type, (e: Event) => {
                const { fieldId, index, visible } = (e as ReturnType<typeof entryEvents.setEntryVisibility>).detail;

                if (fieldId) {
                        const entries = HTML.entriesList.querySelectorAll(`.entry[data-field-id="${fieldId}"]`)

                        const entriesArr = Array.from(entries);
                        if (visible) {
                                setStateClass([], entriesArr, "hidden")
                        }
                        else {
                                setStateClass(entriesArr, [], "hidden")
                        }
                }
                else if (index) {
                        const entrySets = HTML.entriesList.querySelectorAll(".entry-set") as NodeListOf<HTMLDivElement>;

                        for (const entrySet of entrySets) {
                                const elemAtInd = entrySet.children.item(index);

                                elemAtInd?.classList.add("hidden");
                        }
                }
        });

        window.addEventListener(entryEvents.showFieldEntries.type, (e: Event) => {
                const fieldId = (e as ReturnType<typeof entryEvents.showFieldEntries>).detail;
                const entries = HTML.entriesList.querySelectorAll(`[data-field-id="${fieldId}"]`)

                setStateClass([], Array.from(entries), "hidden")
        });

        window.addEventListener(entryEvents.btnTriggered.type, (e: Event) => {
                const btnDiv = (e as ReturnType<typeof entryEvents.btnTriggered>).detail;

                const entryId = btnDiv.dataset.entryId;
                if (!entryId) return;

                btnPress(entryId)
        });

        window.addEventListener(entryEvents.newFieldEntries.type, (e: Event) => {
                const data = (e as ReturnType<typeof entryEvents.newFieldEntries>).detail;

                createFieldEntries(data.field, data.entryIds);
        });

        window.addEventListener(entryEvents.setFieldEntriesIndices.type, (e: Event) => {
                const { fieldId, index } = (e as ReturnType<typeof entryEvents.setFieldEntriesIndices>).detail;

                const entries = HTML.entriesContainer.querySelectorAll(`.entry[data-field-id="${fieldId}"]`) as NodeListOf<HTMLElement>;
                entries.forEach(e => {
                        e.dataset.order = `${index}`;
                        e.style.order = `${index}`;
                });
        });

        window.addEventListener(entryEvents.updateFieldEntries.type, (e: Event) => {
                const data = (e as ReturnType<typeof entryEvents.updateFieldEntries>).detail;

                updateFieldEntries(data.entries, data.index);
        });

        window.addEventListener(entryEvents.newRow.type, () => {
                if (BoardState.fields.size == 0) {
                        showToast(`Cannot make a new row, no existing fields`, "error")
                        return;
                }

                BoardState.incrementRowCount()

                const fields = Array.from(BoardState.fields.values()).sort((a, b) => a.index! - b.index!);
                const entries = fields.map(field => {
                        return {
                                id: crypto.randomUUID(),
                                field_id: field.id,
                                value: "",
                                type: field.type,
                                date_modified: new Date(),
                        } as Entry;
                });

                const fieldEntryIdMap = {} as Record<string, string>;
                for (const entry of entries) { fieldEntryIdMap[entry.field_id!] = entry.id!; }

                const row = createEntryRow(entries);

                HTML.entriesList.appendChild(row);

                insertEmptyEntryRows([fieldEntryIdMap])
                        .then((data) => {
                                row.dataset.index = `${data[0].row_index}`

                                data[0].entries.forEach(e => {
                                        if (e.option_id) {
                                                const elem = row.querySelector(`[data-entry-id="${e.id!}"]`) as HTMLElement;

                                                elem.dataset.optionId = e.option_id;
                                        }
                                });
                        })
                        .catch(err => {
                                row.remove();
                                BoardState.decrementRowCount();
                                showToast(`Failed to create entry row ${err}`, "error");
                        });
        });

        window.addEventListener(entryEvents.realtimeNewRows.type, (e: Event) => {
                const entryRowsArr = (e as ReturnType<typeof entryEvents.realtimeNewRows>).detail;

                const rows = entryRowsArr.map(e => createEntryRow(e.entries));

                HTML.entriesList.append(...rows);
        });

        window.addEventListener(entryEvents.copyRow.type, async (e: Event) => {
                const entrySets = (e as ReturnType<typeof entryEvents.copyRow>).detail;

                const entryRowsArr = [] as Array<Array<Entry>>;
                const rows = [] as Array<HTMLDivElement>;

                for (const entrySet of entrySets) {
                        const entries = await createEntryCopiesFromEntrySet(entrySet);
                        const row = createEntryRow(entries);

                        rows.push(row)
                        entryRowsArr.push(entries)
                }

                HTML.entriesList.append(...rows);

                insertEntryRows(entryRowsArr)
                        .then((indArr) => {
                                for (let i = 0; i < rows.length; i++) {
                                        const row = rows[i];
                                        row.dataset.index = `${indArr[i]}`;
                                }
                        })
                        .catch(() => {
                                rows.forEach(row => row.remove());

                                const rendered = BoardState.rowCount.rendered;
                                const all = BoardState.rowCount.all;

                                BoardState.setRowCount({ rendered, all });
                        });
        });

        window.addEventListener(entryEvents.togglePin.type, (e: Event) => {
                const entrySet = (e as ReturnType<typeof entryEvents.togglePin>).detail;
                const container = entrySet.parentElement as HTMLDivElement;

                const rowIndex = entrySet.dataset.index;

                entrySet.classList.toggle("pinned");

                if (container === HTML.entriesList) {
                        const pinnedEntrySet = HTML.pinnedEntriesList.querySelector(`[data-index="${rowIndex}"]`) as HTMLDivElement;
                        if (pinnedEntrySet) {
                                pinnedEntrySet.remove();
                                return;
                        }

                        const copiedEntrySet = entrySet.cloneNode(true);
                        HTML.pinnedEntriesList.appendChild(copiedEntrySet);
                }
                else {
                        const entrySetInList = HTML.entriesList.querySelector(`[data-index="${rowIndex}"]`) as HTMLDivElement;
                        entrySetInList.classList.toggle("pinned");
                        entrySet.remove();
                }
        });

        window.addEventListener(entryEvents.sortChange.type, async () => {
                const result = await BoardState.entryFetchGenerator!.next();

                if (result.done) return;
                const entries = result.value ?? [];

                setEntryRows(entries, false);
        });

        window.addEventListener(entryEvents.clearEntries.type, () => {
                if (!BoardState.isInitialized) return;
                HTML.entriesList.innerHTML = "";
                HTML.pinnedEntriesList.innerHTML = "";
        });
}
