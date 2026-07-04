import { closeDialog, setStateClass, showToast } from "@/core/utils/dom";
import { HTML } from "./html";
import { changeAllEntryChecks, changeFieldEntries, createEntryCopiesFromEntrySet as createEntryCopiesFromEntrySets, createEntryRow, createFieldEntries, entryCheckChange, setupDropdown, swapEntriesDOM, swapEntriesVisually, updateFieldEntries } from "./view";
import { insertEntries, updateEntry, deleteRows, triggerAutomation, } from "./logic";
import { BoardStore } from "../board-state";
import { entryEvents } from "./custom-events";
import { bottomToolbarEvents } from "../bottom-toolbar/custom-events";
import { AutomationId } from "../automations/types";
import { changeDeepestValue } from "./view-utils";
import type { Entry } from "./types";

let prevEntryVal: string | undefined;

export function initEntryEvents() {
        if (BoardStore.isInitialized) return;

        HTML.entryDiv.addEventListener("click", async (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] === "entry-status" && (elem instanceof HTMLDivElement)) {
                        window.dispatchEvent(entryEvents.statusClicked(elem));
                }
                else if (elem.className === "btn-entry") {
                        window.dispatchEvent(entryEvents.btnTriggered(elem.parentElement as HTMLDivElement));
                }
                else if (elem.className === "entry-check") {
                        window.dispatchEvent(entryEvents.checkChange());
                }
        });

        HTML.entryDiv.addEventListener("focusin", (e: FocusEvent) => {
                const elem = e.target as HTMLElement;
                if (elem.classList[0] != "entry") return;

                prevEntryVal = (elem as HTMLInputElement).value;
        });

        HTML.entryDiv.addEventListener("focusout", (e: FocusEvent) => {
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
                const entryElem = HTML.entryDiv.querySelector(`[data-entry-id="${entryId}"]`) as HTMLDivElement;


                const value = elem.dataset.value ?? "";
                if (value == entryElem.dataset.dbValue) return;

                if (entryElem instanceof HTMLInputElement) {
                        entryElem.value = value;
                } else {
                        entryElem.innerText = value;
                }

                updateEntry(entryId!, value)
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

        window.addEventListener(entryEvents.statusClicked.type, (e: Event) => {
                const elem = (e as ReturnType<typeof entryEvents.statusClicked>).detail;

                if (!elem.dataset.fieldId || ["", "undefined"].includes(elem.dataset.fieldId)) {
                        console.error("fieldId is not set --> error");
                        return;
                }

                setupDropdown(elem);
        });

        window.addEventListener(entryEvents.entryCheckChangeAll.type, (e: Event) => {
                const checked = (e as ReturnType<typeof entryEvents.entryCheckChangeAll>).detail;

                changeAllEntryChecks(checked);
        });

        window.addEventListener(entryEvents.realtimeEntryChange.type, (e: Event) => {
                const object = (e as ReturnType<typeof entryEvents.realtimeEntryChange>).detail;

                const elem = HTML.entryDiv.querySelector(`.entry[data-entry-id="${object.entryId}"]`) as HTMLDivElement | HTMLInputElement;
                if (!elem) return;

                changeDeepestValue(elem, object.value);
        });

        window.addEventListener(entryEvents.entryChangeFieldValues.type, (e: Event) => {
                const object = (e as ReturnType<typeof entryEvents.entryChangeFieldValues>).detail;

                changeFieldEntries(object);
        });
        window.addEventListener(entryEvents.checkChange.type, () => entryCheckChange());

        window.addEventListener(entryEvents.visuallySwap.type, (e: Event) => {
                const object = (e as ReturnType<typeof entryEvents.visuallySwap>).detail;
                swapEntriesVisually(object);
        });

        window.addEventListener(entryEvents.swapDOM.type, (e: Event) => {
                const object = (e as ReturnType<typeof entryEvents.swapDOM>).detail;

                swapEntriesDOM(object);
        });

        window.addEventListener(entryEvents.removeSelected.type, _ => {
                const entryChecks = HTML.entryDiv.querySelectorAll(".entry-check:checked") as NodeListOf<HTMLInputElement>;

                const indices: Array<number> = [];

                for (const entryCheck of entryChecks)
                        indices.push(Number(entryCheck.dataset.index));

                deleteRows(indices)
                        .then(_ => {
                                BoardStore.setRowCount(BoardStore.rowCount - entryChecks.length)

                                entryChecks.forEach(entryCheck => (entryCheck.closest(".entry-set") as HTMLDivElement).remove());
                        })
                        .catch(err => showToast(`Failed to delete rows: ${err}`, "error"));
        });

        window.addEventListener(entryEvents.realtimeRemoveEntries.type, (e: Event) => {
                const { fieldId, indices } = (e as ReturnType<typeof entryEvents.realtimeRemoveEntries>).detail;

                if (fieldId != undefined) {
                        const entries = HTML.entryDiv.querySelectorAll(`[data-field-id="${fieldId}"]`)
                        for (const entry of entries) entry.remove();
                }
                else if (indices != undefined) {
                        const entrySets = HTML.entryDiv.querySelectorAll(".entry-set") as NodeListOf<HTMLDivElement>;
                        for (const index of indices) {
                                entrySets[index].remove();
                        }

                        BoardStore.setRowCount(BoardStore.rowCount - indices.length)
                }
        });

        window.addEventListener(entryEvents.hideFieldEntries.type, (e: Event) => {
                const obj = (e as ReturnType<typeof entryEvents.hideFieldEntries>).detail;
                console.log("hide field entries", obj);


                if (obj.fieldId != undefined) {
                        const entries = HTML.entryDiv.querySelectorAll(`.entry[data-field-id="${obj.fieldId}"]`)
                        console.log(entries);

                        setStateClass(Array.from(entries), [], "hidden")
                }
                else if (obj.index != undefined) {
                        const entrySets = HTML.entryDiv.querySelectorAll(".entry-set") as NodeListOf<HTMLDivElement>;
                        console.log(entrySets);

                        for (const entrySet of entrySets) {
                                const elemAtInd = entrySet.children.item(obj.index);
                                console.log(elemAtInd);

                                elemAtInd?.classList.add("hidden");
                        }
                }
        });

        window.addEventListener(entryEvents.showFieldEntries.type, (e: Event) => {
                const fieldId = (e as ReturnType<typeof entryEvents.showFieldEntries>).detail;
                const entries = HTML.entryDiv.querySelectorAll(`[data-field-id="${fieldId}"]`)

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

        window.addEventListener(entryEvents.updateFieldEntries.type, (e: Event) => {
                const data = (e as ReturnType<typeof entryEvents.updateFieldEntries>).detail;

                updateFieldEntries(data.entries, data.index);
        });

        window.addEventListener(entryEvents.newRow.type, () => {
                if (BoardStore.fields.size == 0) {
                        console.log("showing toast");

                        showToast(`Cannot make a new row, no existing fields`, "error")
                        return;
                }

                const index = BoardStore.rowCount + 1; /* start --> 1 */

                const fields = Array.from(BoardStore.fields.values()).sort((a, b) => a.index! - b.index!);
                const entries = fields.map(field => ({
                        id: crypto.randomUUID(),
                        field_id: field.id,
                        value: field.gen_value ?? "",
                        type: field.type,
                        index: index,
                        date_modified: new Date(),
                } as Entry));

                const row = createEntryRow(entries);

                HTML.entryDiv.appendChild(row);

                insertEntries(entries)
                        .then(_ => BoardStore.incrementRowCount())
                        .catch(err => {
                                row.remove();
                                showToast(`Failed to create entry row ${err}`, "error");
                        });

                window.dispatchEvent(bottomToolbarEvents.visible({ visible: false, checkedCount: 0 }));
        });

        window.addEventListener(entryEvents.realtimeNewRows.type, (e: Event) => {
                const entries = (e as ReturnType<typeof entryEvents.realtimeNewRows>).detail;

                const rows = [] as Array<HTMLDivElement>;
                const rowLen = BoardStore.fields.values.length;
                for (let i = 0; i < entries.length; i += rowLen) {
                        const rowEntries = entries.slice(i, i + rowLen);
                        const row = createEntryRow(rowEntries);

                        rows.push(row);
                }

                HTML.entryDiv.append(...rows);
        });

        window.addEventListener(entryEvents.copyRow.type, async (e: Event) => {
                const entrySets = (e as ReturnType<typeof entryEvents.copyRow>).detail;

                const entrySetLen = entrySets[0].children.length - 1;
                const entries = await createEntryCopiesFromEntrySets(entrySets);

                const rows = [] as Array<HTMLDivElement>;

                for (let i = 0; i < entries.length; i += entrySetLen) {
                        const row = createEntryRow(entries.slice(i, i + entrySetLen));
                        rows.push(row)
                }

                HTML.entryDiv.append(...rows);

                insertEntries(entries)
                        .then(() => { BoardStore.setRowCount(BoardStore.rowCount + rows.length) })
                        .catch(() => { for (const row of rows) { HTML.entryDiv.removeChild(row); } });
        });

        window.addEventListener(entryEvents.disposeAll.type, () => {
                if (!BoardStore.isInitialized) return;
                HTML.entryDiv.innerHTML = "";
        })
}
