import { closeDialog, setStateClass, showToast } from "@/core/utils/dom";
import { HTML } from "./html";
import { changeAllEntryChecks, changeFieldEntries, createEntryCopiesFromEntrySet, createEntryRow, createFieldEntries, entryCheckChange, setEntryRows, setupStatusDropdown, swapEntriesDOM, swapEntriesVisually, updateFieldEntries } from "./view";
import { insertEntryRow, updateEntry, deleteRows, triggerAutomation, insertEntryRows, } from "./logic";
import { BoardStore } from "../board-state";
import { entryEvents } from "./custom-events";
import { AutomationId } from "../automations/types";
import { changeDeepestValue } from "./view-utils";
import type { Entry } from "./types";

let prevEntryVal: string | undefined;

let debounceTimer: number;

export function initEntryEvents() {
        if (BoardStore.isInitialized) return;

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
        })

        HTML.dropdown.optionsContainer.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLDivElement;

                if (elem.className !== "dropdown-option") {
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
                        BoardStore.setSearchQuery(value)

                        const result = await BoardStore.entryFetchGenerator!.next();

                        if (result.done) return;
                        const entries = result.value ?? [];

                        console.log(entries);


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

        window.addEventListener(entryEvents.entryCheckChangeAll.type, (e: Event) => {
                const checked = (e as ReturnType<typeof entryEvents.entryCheckChangeAll>).detail;

                changeAllEntryChecks(checked);
        });

        window.addEventListener(entryEvents.realtimeEntryChange.type, (e: Event) => {
                const object = (e as ReturnType<typeof entryEvents.realtimeEntryChange>).detail;

                const elem = HTML.entriesList.querySelector(`.entry[data-entry-id="${object.entryId}"]`) as HTMLDivElement | HTMLInputElement;
                if (!elem) return;

                changeDeepestValue(elem, object.value);
        });

        window.addEventListener(entryEvents.entryChangeFieldValues.type, (e: Event) => {
                const object = (e as ReturnType<typeof entryEvents.entryChangeFieldValues>).detail;

                changeFieldEntries(object);
        });
        window.addEventListener(entryEvents.checkChange.type, (e: Event) => {
                const check = (e as ReturnType<typeof entryEvents.checkChange>).detail;
                entryCheckChange(check);
        });

        window.addEventListener(entryEvents.visuallySwap.type, (e: Event) => {
                const object = (e as ReturnType<typeof entryEvents.visuallySwap>).detail;
                swapEntriesVisually(object);
        });

        window.addEventListener(entryEvents.swapDOM.type, (e: Event) => {
                const object = (e as ReturnType<typeof entryEvents.swapDOM>).detail;

                swapEntriesDOM(object);
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

                                const renderedRows = BoardStore.rowCount.rendered - indices.length;
                                const allRows = BoardStore.rowCount.all - indices.length;

                                BoardStore.setRowCount({ rendered: renderedRows, all: allRows });
                        })
                        .catch(err => {
                                entrySets.forEach(e => e.style.display = "block");
                                showToast(`Failed to delete rows: ${err}`, "error");
                        });
        });

        window.addEventListener(entryEvents.realtimeRemoveEntries.type, (e: Event) => {
                const { fieldId, indices } = (e as ReturnType<typeof entryEvents.realtimeRemoveEntries>).detail;

                if (fieldId != undefined) {
                        const fieldSize = BoardStore.fields.size;

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
                        const entrySets = HTML.entriesList.querySelectorAll(".entry-set") as NodeListOf<HTMLDivElement>;
                        for (const index of indices) {
                                entrySets[index].remove();
                        }

                        const renderedRows = BoardStore.rowCount.rendered - indices.length;
                        const allRows = BoardStore.rowCount.all - indices.length;

                        BoardStore.setRowCount({ rendered: renderedRows, all: allRows })
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
                const fieldId = btnDiv.dataset.fieldId;

                const entrySet = btnDiv.parentElement as HTMLDivElement;
                const rowIndex = Number(entrySet.dataset.index);

                triggerAutomation([AutomationId.ButtonPress], { entryId, fieldId, rowIndex })
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
                if (BoardStore.fields.size == 0) {
                        showToast(`Cannot make a new row, no existing fields`, "error")
                        return;
                }

                BoardStore.incrementRowCount()

                const fields = Array.from(BoardStore.fields.values()).sort((a, b) => a.index! - b.index!);
                const entries = fields.map(field => ({
                        id: crypto.randomUUID(),
                        field_id: field.id,
                        value: field.type == "button" ? field!.options![0].value ?? "" : "",
                        type: field.type,
                        date_modified: new Date(),
                } as Entry));

                const row = createEntryRow(entries);

                HTML.entriesList.appendChild(row);

                insertEntryRow(entries)
                        .then(index => row.dataset.index = `${index}`)
                        .catch(err => {
                                row.remove();
                                BoardStore.decrementRowCount();
                                showToast(`Failed to create entry row ${err}`, "error");
                        });
        });

        window.addEventListener(entryEvents.realtimeNewRows.type, (e: Event) => {
                const entries = (e as ReturnType<typeof entryEvents.realtimeNewRows>).detail;

                const rows = [] as Array<HTMLDivElement>;
                const rowLen = BoardStore.fields.size;

                for (let i = 0; i < entries.length; i += rowLen) {
                        const rowEntries = entries.slice(i, i + rowLen);

                        const row = createEntryRow(rowEntries);

                        rows.push(row);
                }

                HTML.entriesList.append(...rows);
        });

        window.addEventListener(entryEvents.copyRow.type, async (e: Event) => {
                const entrySets = (e as ReturnType<typeof entryEvents.copyRow>).detail;

                const entriesArr = [] as Array<Array<Entry>>;
                const rows = [] as Array<HTMLDivElement>;

                for (const entrySet of entrySets) {
                        const entries = await createEntryCopiesFromEntrySet(entrySet);
                        const row = createEntryRow(entries);

                        rows.push(row)
                        entriesArr.push(entries)
                }

                HTML.entriesList.append(...rows);

                insertEntryRows(entriesArr)
                        .then((indArr) => {
                                for (let i = 0; i < rows.length; i++) {
                                        const row = rows[i];
                                        row.dataset.index = `${indArr[i]}`;
                                }
                        })
                        .catch(() => {
                                rows.forEach(row => row.remove());

                                const rendered = BoardStore.rowCount.rendered;
                                const all = BoardStore.rowCount.all;

                                BoardStore.setRowCount({ rendered, all });
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
                const result = await BoardStore.entryFetchGenerator!.next();

                if (result.done) return;
                const entries = result.value ?? [];

                setEntryRows(entries, false);
        });

        window.addEventListener(entryEvents.disposeAll.type, () => {
                if (!BoardStore.isInitialized) return;
                HTML.entriesList.innerHTML = "";
        });
}
