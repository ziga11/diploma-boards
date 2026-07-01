import { closeDialog, setStateClass, showToast } from "@/core/utils/dom";
import { BoardStore } from "../board-state";
import { HTML } from "./html";
import { deleteField, insertFieldAndEntries, insertFieldOption, removeFieldOption, switchIndex, updateFieldName, updateFieldOption } from "./logic";
import { addHTMLField, addStatusOption, fieldDrag, populateFieldEditModal, toggleNewFieldMenu } from "./view";
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
                const entryIds = Array.from({ length: BoardStore.rowCount }, () => crypto.randomUUID());

                window.dispatchEvent(entryEvents.newFieldEntries({ field, entryIds }));

                const fieldDiv = addHTMLField(field);

                closeDialog(HTML.newFieldMenu);

                insertFieldAndEntries(fieldType!, field.id!, entryIds)
                        .then(data => {
                                const newField = data.field;
                                newField.fieldHelpers = [];

                                BoardStore.fields.set(newField.id!, newField);
                        })
                        .catch(err => {
                                const index = Array.from(HTML.fieldsDiv.children).indexOf(fieldDiv);
                                window.dispatchEvent(entryEvents.deleteFieldEntries({ index: index }));

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
                                        window.dispatchEvent(entryEvents.deleteFieldEntries({ fieldId: fieldId }));
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

                        const fieldHelper = { id, value } as FieldHelper;
                        field?.fieldHelpers?.push(fieldHelper);

                        const statusOptionDiv = addStatusOption(fieldHelper);

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

                window.dispatchEvent(entryEvents.entryChangeAll({ fieldId, value }));

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
                        window.dispatchEvent(entryEvents.entryChangeAll({ fieldId, value: dbValue }));

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
                                console.log(err);
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

                        const field = BoardStore.getField(fieldId) as Field;

                        HTML.editModal.modal.showModal();
                        populateFieldEditModal(field);
                }
                else if (elem.className == HTML.fieldCheck.className) {
                        window.dispatchEvent(entryEvents.entryCheckChangeAll(HTML.fieldCheck.checked));
                }
        });

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

                window.dispatchEvent(entryEvents.swapDOM({ finalIndex, increase }));

                switchIndex(fieldId, startIndex, finalIndex).catch(err => showToast(`Error switching indecies ${err}`, "error"));
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

        window.addEventListener(fieldEvents.disposeAll.type, () => {
                if (!BoardStore.isInitialized) return;
                HTML.fieldsDiv.querySelectorAll(".field-div").forEach(el => el.remove());
        })
}
