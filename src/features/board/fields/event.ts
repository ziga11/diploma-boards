import { closeDialog, setStateClass, showToast } from "@/core/utils/dom";
import { BoardStore } from "../board-state";
import { HTML } from "./html";
import { deleteField, insertFieldAndEntries, insertFieldOption, removeFieldOption, switchIndex, updateFieldName, updateFieldOption } from "./logic";
import { addHTMLField, createStatusOption, fieldDrag, populateFieldEditModal, toggleNewFieldMenu } from "./view";
import type { Field, FieldHelper } from "./types";
import { entryEvents, } from "../entries/custom-events";
import { fieldEvents } from "./custom-events";

interface DragInterface {
        field?: HTMLDivElement,
        fieldRect?: DOMRect,
        startIndex?: number,
}

export let dragProps = {} as DragInterface

export function initFieldEvents() {
        if (BoardStore.isInitialized) return;

        HTML.newFieldBtn.addEventListener("click", (e: MouseEvent) => {
                e.stopPropagation();
                toggleNewFieldMenu();
        });

        HTML.newFieldMenu.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                const fieldType = elem.dataset.fieldType;
                if (!fieldType) return;

                const field = { id: crypto.randomUUID(), type: fieldType } as Field
                const entryIds = Array.from({ length: BoardStore.rowCount.all }, () => crypto.randomUUID());


                const fieldElem = addHTMLField(field);

                closeDialog(HTML.newFieldMenu);

                insertFieldAndEntries(fieldType!, field.id!, entryIds)
                        .then(data => {
                                const newField = data.field;
                                newField.fieldHelpers = [];

                                BoardStore.fields.set(newField.id!, newField);

                                fieldElem.dataset.order = `${data.field.index}`;
                                window.dispatchEvent(entryEvents.newFieldEntries({ field, entryIds, index: data.field.index! }));
                        })
                        .catch(err => {
                                fieldElem.remove();

                                showToast(`Failed to add new field: ${err.message}`, "error");
                        });
        });

        HTML.editModal.modal.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                const fieldId = HTML.editModal.idSpan.innerText;

                if (elem == HTML.editModal.deleteBtn) {
                        window.dispatchEvent(entryEvents.hideFieldEntries({ fieldId: fieldId }));
                        const field = HTML.fieldsDiv.querySelector(`[data-field-id="${fieldId}"]`) as HTMLDivElement;

                        const nextSibling = field?.nextSibling;
                        field?.remove();

                        deleteField(fieldId)
                                .then(_ => {
                                        window.dispatchEvent(entryEvents.realtimeRemoveEntries({ fieldId: fieldId }));
                                })
                                .catch(err => {
                                        HTML.fieldsDiv.insertBefore(field, nextSibling);
                                        window.dispatchEvent(entryEvents.showFieldEntries(fieldId));

                                        showToast(`Failed to remove field ${err}`, "error");
                                });
                }
                else if (elem == HTML.editModal.status.addBtn) {
                        const value = HTML.editModal.status.addInput.value.trim();
                        if (!fieldId) {
                                showToast("field id not set", "error");
                                return;
                        }
                        if (!value) {
                                showToast("value of the option cannot be empty", "error");
                                return;
                        }

                        const id = crypto.randomUUID();

                        const field = BoardStore.getField(fieldId);
                        if (!field) return;

                        const fieldHelper = { id, field_id: field.id, value } as FieldHelper;
                        field?.fieldHelpers?.push(fieldHelper);

                        const statusOptionDiv = createStatusOption(fieldHelper);

                        HTML.editModal.status.list.appendChild(statusOptionDiv);
                        HTML.editModal.status.addInput.value = "";

                        statusOptionDiv.dataset.helperId = id;

                        insertFieldOption(id, fieldId, value)
                                .catch(err => {
                                        HTML.editModal.status.addInput.value = value;
                                        statusOptionDiv.remove();
                                        showToast(`Failed to add the field option: ${err}`, "error");
                                });
                }
                else if (elem.className == "remove-status-option") {
                        const div = elem.closest(".status-option-item") as HTMLDivElement;
                        const id = div.dataset.helperId;

                        const nextSibling = div.nextSibling;
                        div.remove();

                        removeFieldOption(id)
                                .catch(err => {
                                        if (nextSibling) { HTML.editModal.status.list.insertBefore(div, nextSibling); }
                                        else { HTML.editModal.status.list.appendChild(div); }

                                        showToast(`Failed to remove the status option: ${err}`, "error");
                                });
                }
        });

        HTML.editModal.idDiv.addEventListener("click", () => {
                const fieldId = HTML.editModal.idSpan.innerText;

                showToast("ID copied to clipboard", "success");
                navigator.clipboard.writeText(fieldId);
        })

        HTML.editModal.button.input.addEventListener("keydown", (e: KeyboardEvent) => {
                const input = e.target as HTMLInputElement;
                if (e.key == "Enter") input.blur();
        });

        HTML.editModal.button.input.addEventListener("blur", async (_) => {
                const input = HTML.editModal.button.input;
                const fieldId = HTML.editModal.idSpan.innerText;
                const value = input.value;

                const id = crypto.randomUUID();
                const fieldHelperId = input.dataset.helperId;

                window.dispatchEvent(entryEvents.entryChangeFieldValues({ fieldId, value }));

                const field = HTML.fieldsDiv.querySelector(`.field-div[data-field-id="${fieldId}"]`) as HTMLDivElement;
                field.dataset.entryValue = value;

                try {
                        if (fieldHelperId) {
                                await updateFieldOption({ fieldId, fieldHelperId, value });
                        }
                        else {
                                await insertFieldOption(id, fieldId, value);
                        }

                        input.dataset.dbValue = value;
                }
                catch (err) {
                        const dbValue = input.dataset.dbValue!;
                        window.dispatchEvent(entryEvents.entryChangeFieldValues({ fieldId, value: dbValue }));

                        showToast(`Failed to update the button text`, "error");
                }
        });

        HTML.editModal.input.addEventListener("blur", () => {
                const newName = HTML.editModal.input.value;
                const fieldId = HTML.editModal.idSpan.innerText;

                if (HTML.editModal.input.dataset.dbValue == newName || !fieldId) return;


                const fieldDiv = HTML.fieldsDiv.querySelector(`.field-div[data-field-id="${fieldId}"]`) as HTMLDivElement;

                const inp = fieldDiv.firstChild as HTMLSpanElement;
                inp.innerText = newName;

                updateFieldName(fieldId, newName)
                        .then(_ => HTML.editModal.input.dataset.dbValue = newName)
                        .catch(err => {
                                inp.innerText = HTML.editModal.input.dataset.dbValue!;
                                showToast(`Failed to change the field name: ${err}`, "error");
                        });
        });

        HTML.editModal.modal.addEventListener("close", () => {
                HTML.editModal.button.section.classList.add("d-none");
                HTML.editModal.status.section.classList.add("d-none");
        });

        HTML.fieldsDiv.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] == "edit-field") {
                        const fieldDiv = elem.parentElement as HTMLDivElement;
                        const fieldId = fieldDiv.dataset.fieldId;
                        if (!fieldId) return;


                        const fieldRect = fieldDiv.getBoundingClientRect();

                        HTML.fieldDropdown.style.left = `${fieldRect.left}px`;
                        HTML.fieldDropdown.style.top = `${fieldRect.bottom + 2}px`;

                        HTML.fieldDropdown.dataset.fieldId = fieldId;

                        const ascending = HTML.fieldDropdown.querySelector("#sort-ascending-btn");
                        const descending = HTML.fieldDropdown.querySelector("#sort-descending-btn");

                        ascending?.classList.remove("active");
                        descending?.classList.remove("active");

                        if (BoardStore.sortedBy.fieldId == fieldId) {
                                const option = BoardStore.sortedBy.ascending ? ascending : descending;

                                option?.classList.add("active");
                        }

                        HTML.fieldDropdown.showModal();
                }
                else if (elem.className == HTML.fieldCheck.className) {
                        window.dispatchEvent(entryEvents.entryCheckChangeAll(HTML.fieldCheck.checked));
                }
        });

        HTML.fieldDropdown.addEventListener("click", async (e: Event) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] != "field-dropdown-option") return;

                const fieldId = HTML.fieldDropdown.dataset.fieldId;
                if (!fieldId) return;

                if (elem.id === "edit-field") {
                        const field = BoardStore.getField(fieldId!) as Field;
                        populateFieldEditModal(field);

                        closeDialog(HTML.fieldDropdown);
                        HTML.editModal.modal.showModal();
                }
                else {
                        const ascending = elem.id === "sort-ascending-btn";

                        const currSort = BoardStore.sortedBy;
                        if (currSort?.fieldId == fieldId && currSort.ascending == ascending) {
                                BoardStore.setSortedBy(undefined, undefined);
                        }
                        else {
                                BoardStore.setSortedBy(fieldId, ascending);
                        }

                        window.dispatchEvent(entryEvents.sortChange());
                        closeDialog(HTML.fieldDropdown);
                }
        })

        HTML.fieldsDiv.addEventListener("mouseover", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                const fieldDiv = elem.closest(".field-div");
                const currEditElem = HTML.fieldsDiv.querySelector(".edit-field.shown") as HTMLButtonElement | undefined;;

                if (!fieldDiv) {
                        setStateClass([], currEditElem ? [currEditElem] : [], "shown");
                        return;
                }

                const newEditElem = fieldDiv.querySelector(".edit-field") as HTMLButtonElement;

                if (newEditElem === currEditElem) return;

                setStateClass([newEditElem], currEditElem ? [currEditElem] : [], "shown");
        });

        HTML.fieldsDiv.addEventListener("mouseleave", () => {
                const currEditElem = HTML.fieldsDiv.querySelector(".edit-field.shown") as HTMLButtonElement;

                setStateClass([], currEditElem ? [currEditElem] : [], "shown");
        });

        document.addEventListener("mousedown", (e: MouseEvent) => {
                const elem = e.target as HTMLDivElement;
                if (elem.classList[0] != "field-div") return;

                dragProps = {
                        field: elem,
                        startIndex: Number(elem.dataset.order),
                        fieldRect: elem.getBoundingClientRect(),
                };

                document.addEventListener("mousemove", fieldDrag);
        });

        document.addEventListener("mouseup", () => {
                document.removeEventListener("mousemove", fieldDrag);

                const fieldId = dragProps.field?.dataset.fieldId;
                const finalIndex = Number(dragProps.field?.dataset.order);
                const startIndex = dragProps.startIndex!;

                if (!startIndex || startIndex == finalIndex || !fieldId) return;

                const increase = finalIndex > startIndex;

                window.dispatchEvent(fieldEvents.swapField({ fieldId, startIndex, finalIndex }));

                window.dispatchEvent(entryEvents.swapDOM({ finalIndex, increase }));
        });

        window.addEventListener(fieldEvents.swapField.type, (e: Event) => {
                const { fieldId, startIndex, finalIndex } = (e as ReturnType<typeof fieldEvents.swapField>).detail;

                console.log(fieldId, startIndex, finalIndex);


                switchIndex(fieldId, startIndex, finalIndex)
                        .catch(err => showToast(`Error switching indecies ${err}`, "error"));

                dragProps = {};
        });

        window.addEventListener(fieldEvents.checkChange.type, (e: Event) => {
                const checked = (e as ReturnType<typeof fieldEvents.checkChange>).detail;

                HTML.fieldCheck.checked = checked;
        });

        window.addEventListener(fieldEvents.realtimeFieldNameUpdate.type, (e: Event) => {
                const field = (e as ReturnType<typeof fieldEvents.realtimeFieldNameUpdate>).detail;

                const newName = field.name;
                const fieldId = field.id;

                if ([newName, fieldId].includes(undefined)) return;

                const f = BoardStore.getField(fieldId!) as Field;
                f.name = newName!;

                const fieldDiv = HTML.fieldsDiv.querySelector(`.field-div[data-field-id="${fieldId}"]`) as HTMLDivElement;

                const inp = fieldDiv.firstChild as HTMLSpanElement;
                inp.innerText = newName!;
        });

        window.addEventListener(fieldEvents.realtimeAddField.type, (e: Event) => {
                const field = (e as ReturnType<typeof fieldEvents.realtimeAddField>).detail;

                field.fieldHelpers = [];

                BoardStore.fields.set(field.id!, field);

                addHTMLField(field);
        });

        window.addEventListener(fieldEvents.realtimeAddFieldHelper.type, (e: Event) => {
                const fieldHelper = (e as ReturnType<typeof fieldEvents.realtimeAddFieldHelper>).detail;

                const field = BoardStore.getField(fieldHelper.field_id!);
                if (!field) return;

                if (!field.fieldHelpers) {
                        field.fieldHelpers = [];
                }

                field.fieldHelpers!.push(fieldHelper);
        });

        window.addEventListener(fieldEvents.realtimeUpdateFieldHelper.type, (e: Event) => {
                const fieldHelper = (e as ReturnType<typeof fieldEvents.realtimeUpdateFieldHelper>).detail;

                const field = BoardStore.getField(fieldHelper.field_id!);
                if (!field) return;

                field.fieldHelpers = field.fieldHelpers!.map(fh => fh.id == fieldHelper.id ? fieldHelper : fh);
        });

        window.addEventListener(fieldEvents.realtimeRemoveFieldHelper.type, (e: Event) => {
                const { fieldId, helperId } = (e as ReturnType<typeof fieldEvents.realtimeRemoveFieldHelper>).detail;

                const field = BoardStore.getField(fieldId);
                if (!field) return;

                field.fieldHelpers = field.fieldHelpers?.filter(fh => fh.id != helperId);
        });

        window.addEventListener(fieldEvents.disposeAll.type, () => {
                if (!BoardStore.isInitialized) return;
                HTML.fieldsDiv.querySelectorAll(".field-div").forEach(el => el.remove());
        })
}
