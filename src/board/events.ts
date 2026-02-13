import { Globals } from "../globals";
import { AutomationId, type Automation, type Board, type Entry, type Field, type FieldHelper } from "../types";
import { copyEntrySet, createExistingAutomation as addExistingAutomation, createOption, findFieldHelper, setStateClass, createAutomationSelectionOption, createEntryRow, createFields, createFieldColumn, showToast } from "./utils";
import { automationElements, boardElements, bottomToolbar, columnTypes } from "./types";

boardElements.backButton.addEventListener("click", () => {
        window.location.href = "index.html"
});

boardElements.boardHeadTitle.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
                e.preventDefault();
                boardElements.boardHeadTitle.blur();
        }
});

boardElements.boardHeadTitle.addEventListener("blur", async () => {
        const newTitle = boardElements.boardHeadTitle.innerText;

        const url = new URL(window.location.href);
        url.searchParams.set("title", newTitle);

        window.history.replaceState({}, '', url);

        await Globals.supabase.updateBoard({
                id: Globals.boardId,
                name: newTitle,
        } as Board);
});

automationElements.backUrlCall.addEventListener("click", () => {
        const elems = automationElements;
        setStateClass([elems.fieldSelection], [elems.createAutomations, elems.urlCallDiv, elems.createdAutomations], "shown")
});

automationElements.modal.addEventListener("hide.bs.modal", () => {
        const elems = automationElements;
        elems.createTab.checked = true;
        setStateClass([], [elems.createAutomations, elems.fieldSelection, elems.urlCallDiv, elems.createdAutomations], "shown")
});

[automationElements.openModalBtn, automationElements.createTab].forEach((btn) => {
        const elems = automationElements;
        elems.createTab.checked = true;
        btn.addEventListener("click", () => {
                setStateClass([elems.createAutomations], [elems.fieldSelection, elems.urlCallDiv, elems.createdAutomations], "shown")
        });
});

automationElements.modifyTab.addEventListener("click", () => {
        automationElements.modifyTab.checked = true;

        setStateClass([automationElements.createdAutomations], [automationElements.fieldSelection, automationElements.urlCallDiv, automationElements.createAutomations], "shown")
});

for (const option of automationElements.automationOptions) {
        const elems = automationElements;
        option.addEventListener("click", () => {
                const linker: Record<AutomationId, string[]> = {
                        [AutomationId.TextChange]: ["text"],
                        [AutomationId.StatusChange]: ["status"],
                        [AutomationId.ButtonPress]: ["button"],
                        [AutomationId.ItemCreated]: ["text", "dropdown", "button"],
                        [AutomationId.ItemDeleted]: ["text", "dropdown", "button"],
                        [AutomationId.AnyColumnChange]: ["text", "dropdown", "button"],
                };
                Globals.automationOption = Number(option.dataset.automationType) as AutomationId;

                let selectionOptions = [];
                const applicableColumnTypes = linker[Globals.automationOption];

                for (const field of Array.from(Globals.fields.values())) {
                        if (applicableColumnTypes.includes(field.type!)) {
                                selectionOptions.push(createAutomationSelectionOption(field));
                        }
                }
                automationElements.fieldSelection.replaceChildren(...selectionOptions);

                setStateClass([elems.fieldSelection], [elems.createdAutomations, elems.urlCallDiv, elems.createAutomations], "shown")
        });
}

automationElements.finishAutomation.addEventListener("click", () => {
        const automation = {
                field_id: Globals.selectedFieldId,
                automation_id: Globals.automationOption,
                url_call: automationElements.urlCallInput.value,
                board_id: Globals.boardId,
                account_id: Globals.account?.id
        } as Automation;

        const elems = automationElements;
        addExistingAutomation(automation);

        elems.urlCallInput.innerText = "";

        Globals.supabase.createFieldAutomation(automation);
        setStateClass([elems.createdAutomations], [elems.urlCallDiv], "shown")
});


automationElements.closeModalBtn.addEventListener("click", () => setStateClass([], [automationElements.modal], "shown"));

boardElements.confirmDeleteBtn.addEventListener("click", async () => {
        await Globals.supabase.deleteBoard(Globals.boardId);
        window.location.href = "index.html"
});

bottomToolbar.deselectSelected.addEventListener("click", () => {
        const selectedEntries = document.querySelectorAll(".entry-check:checked") as NodeListOf<HTMLInputElement>;
        for (const entry of selectedEntries) {
                entry.checked = false;
        }
        boardElements.columnCheck.checked = false;
        bottomToolbar.outerDiv.classList.remove("shown");
        setStateClass([], [bottomToolbar.outerDiv], "shown");
});

bottomToolbar.deleteSelected.addEventListener("mouseover", () => {
        const currSvg = bottomToolbar.deleteSelected.querySelector(".bi-trash3") as SVGSVGElement;
        const newSvg = bottomToolbar.deleteSelected.querySelector(".bi-trash3-fill") as SVGSVGElement;
        setStateClass([newSvg], [currSvg], "shown");
});
bottomToolbar.deleteSelected.addEventListener("mouseout", () => {
        const currSvg = bottomToolbar.deleteSelected.querySelector(".bi-trash3") as SVGSVGElement;
        const newSvg = bottomToolbar.deleteSelected.querySelector(".bi-trash3-fill") as SVGSVGElement;
        setStateClass([newSvg], [currSvg], "shown");
});
bottomToolbar.deleteSelected.addEventListener("click", () => {
        const entryBoxesSelected = document.querySelectorAll(".entry-check:checked") as NodeListOf<HTMLInputElement>;
        const indiciesToDel: Array<number> = [];

        for (const selEntryBox of entryBoxesSelected) {
                indiciesToDel.push(Number(selEntryBox.dataset.index));
                const entrySet = selEntryBox.closest(".entry-set");
                entrySet?.remove();
        }

        bottomToolbar.outerDiv.classList.remove("shown");
        Globals.supabase.deleteEntries(Globals.boardId, { indicies: indiciesToDel });

        boardElements.columnCheck.checked = false;
});

bottomToolbar.duplicateSelected.addEventListener("mouseover", () => {
        const currSvg = bottomToolbar.duplicateSelected.querySelector(".bi-layers") as SVGSVGElement;
        const newSvg = bottomToolbar.duplicateSelected.querySelector(".bi-layers-fill") as SVGSVGElement;
        setStateClass([newSvg], [currSvg], "shown");
});
bottomToolbar.duplicateSelected.addEventListener("mouseout", () => {
        const currSvg = bottomToolbar.duplicateSelected.querySelector(".bi-layers") as SVGSVGElement;
        const newSvg = bottomToolbar.duplicateSelected.querySelector(".bi-layers-fill") as SVGSVGElement;
        setStateClass([newSvg], [currSvg], "shown");
});

bottomToolbar.duplicateSelected.addEventListener("click", async () => {
        const checkedEntries = document.querySelectorAll(".entry-check:checked") as NodeListOf<HTMLInputElement>;

        for (const checkedEntry of checkedEntries) {
                const entrySet = checkedEntry.closest(".entry-set") as HTMLDivElement;
                const newEntries = await copyEntrySet(entrySet, Globals.boardId!);

                await createEntryRow(newEntries);
        }
});

boardElements.confirmAddOption.addEventListener("click", async () => {
        const dropdown = Globals.activeDropdown;
        if (!dropdown.entry || !dropdown.elem || !dropdown.addOption) return;

        const input = boardElements.dropdownMenu
                .querySelector(".dropdown-add-option-input") as HTMLInputElement;

        if (!input.value.trim()) return;
        const fieldHelper = await Globals.supabase.insertFieldHelper({
                field_id: dropdown.entry.field_id!,
                value: input.value
        } as FieldHelper);
        if (!fieldHelper) {
                console.warn("no field helper");
                return;
        }

        const currField = Globals.fields.get(fieldHelper.field_id!);
        if (!currField?.fieldHelpers) {
                currField!.fieldHelpers = [];
        }
        currField!.fieldHelpers!.push(fieldHelper!);

        boardElements.dropdownMenu.insertBefore(createOption(dropdown.entry, dropdown.elem, input.value), dropdown.addOption);
        setStateClass([], [boardElements.dropdownMenu], "add");
        input.value = "";
});

Object.values(columnTypes).forEach((columnType: HTMLDivElement) => {
        columnType.addEventListener("click", async () => {
                const field = await Globals.supabase.insertField({
                        name: "",
                        type: columnType.id,
                        board_id: Globals.boardId,
                        account_id: Globals.account?.id
                });

                if (!field) {
                        return;
                }
                await createFields([field]);
                const rowCount = boardElements.entryChecks.length;

                field.fieldHelpers = [];
                Globals.fields.set(field.id!, field)

                const entries = [] as Array<Entry>;
                for (let i = 1; i <= rowCount; i++) {
                        entries.push({
                                index: i,
                                board_id: Globals.boardId,
                                field_id: field.id,
                                type: field.type,
                                value: null,
                                account_id: Globals.account?.id
                        } as Entry);
                }

                const insertedEntries = await Globals.supabase.insertEntries(entries);
                createFieldColumn(insertedEntries);
                boardElements.addColumnMenu.classList.remove("shown");
        });
});


boardElements.newEntryBtn.addEventListener("click", async () => {
        const entries = [] as Entry[];
        const columnDivs = document.querySelectorAll(".column-div") as NodeListOf<HTMLDivElement>;

        const rowCount = boardElements.entryChecks.length;
        for (const columnDiv of columnDivs) {
                const newEntry = {
                        field_id: Number(columnDiv.dataset.fieldId),
                        board_id: Globals.boardId,
                        type: columnDiv.dataset.type,
                        account_id: Globals.account?.id,
                        value: null,
                        index: rowCount + 1,
                } as Entry;

                entries.push(newEntry);
        }

        const insertedEntries = await Globals.supabase.insertEntries(entries);
        await createEntryRow(insertedEntries);
});


/*INFO: Gen column */

export async function columnInputBlur(ev: FocusEvent, field: Field) {
        const target = ev.target as HTMLInputElement;

        if (target.value.trim().length == 0 || field.name === target.value) return;

        field.name = target.value;
        await Globals.supabase.updateField(field);
}

export async function deleteField(ev: MouseEvent, field: Field) {
        await Globals.supabase.deleteField(field.id!);

        const entriesOfField = document.querySelectorAll(`[data-field-id="${field.id}"]`);
        entriesOfField.forEach(div => { div.remove(); });

        const btn = ev.target as HTMLInputElement;
        const parent = btn.parentElement as HTMLDivElement;

        parent.remove();
}

export function automationOptionClick(ev: MouseEvent) {
        const automationOptionDiv = ev.target as HTMLDivElement;

        setStateClass(
                [automationElements.urlCallDiv],
                [automationElements.createAutomations, automationElements.urlCallDiv, automationElements.createdAutomations],
                "shown");

        Globals.selectedFieldId = Number(automationOptionDiv.dataset.fieldId);
}

export function columnHover(ev: MouseEvent) {
        const columnDiv = ev.target as HTMLDivElement;
        const removeBtn = columnDiv.querySelector(".remove-column") as HTMLButtonElement;
        if (ev.type == "mouseover") {
                removeBtn.classList.add("shown");
        }
        else {
                removeBtn.classList.remove("shown");
        }
}

export async function changeAffectedEntries(field_id: number, currValue: string, newValue: string) {
        const fieldEntries = document.querySelectorAll(`[data-field-id="${field_id}"]`) as NodeListOf<HTMLDivElement>;

        let entries: Array<Entry> = [];
        for (const elem of fieldEntries) {
                if (elem.textContent !== currValue) continue;
                elem.textContent = newValue;

                const entryId = elem.dataset.id!.split("-")[1];
                entries.push({
                        board_id: Globals.boardId,
                        value: newValue,
                        id: Number(entryId)
                } as Entry);
        }
        try {
                await Globals.supabase.updateEntries(entries);
        }
        catch (e) {
                alert(e);
        }
}

/*INFO: Gen Entry */
export async function confirmOptionEdit(e: Event, entry: Entry, option: HTMLDivElement, oldValue: string) {
        e.stopPropagation();
        option.classList.remove("edit");

        const newValue = option.innerText;
        if (option.innerText == oldValue) return;

        Object.assign(option.querySelector("span") as HTMLSpanElement, {
                contentEditable: "false",
        });

        const fieldHelper = findFieldHelper(entry.field_id!, oldValue);
        if (!fieldHelper) {
                console.warn("Couldn't find fieldHelper, returning");
                return;
        }

        fieldHelper.value = newValue;
        await Globals.supabase.updateFieldHelper(newValue, {
                id: fieldHelper.id,
        });

        changeAffectedEntries(entry.field_id!, oldValue, newValue);
};

export async function editOption(ev: MouseEvent) {
        ev.stopPropagation();
        const icon = ev.target as SVGSVGElement;
        const outerDiv = icon.closest(".dropdown-option") as HTMLDivElement;

        const span = Object.assign(outerDiv.querySelector(".dropdown-option-input") as HTMLInputElement, {
                contentEditable: "true",
        });

        span.focus();
        outerDiv.classList.add("edit");
}

export async function removeIcon(ev: MouseEvent, fieldId: number) {
        const icon = ev.target as SVGSVGElement;
        const outerDiv = icon.closest(".custom-option") as HTMLDivElement;
        const input = outerDiv.querySelector(".custom-option-input") as HTMLInputElement;
        outerDiv.remove();

        Globals.supabase.deleteFieldHelper({
                fieldIds: [fieldId],
                values: [input.value],
        });

        ev.stopPropagation();
}

export async function deleteAutomation(div: HTMLElement, automation: Automation) {
        automation.board_id = Globals.boardId;
        await Globals.supabase.deleteFieldAutomation(automation);

        div.remove();
}

export function buttonEntryPress(btn: HTMLButtonElement, span: HTMLSpanElement, entry: Entry) {
        let controller = new AbortController();

        btn.addEventListener("click", () => {
                const signal = controller.signal;
                setTimeout(() => {
                        if (signal.aborted) return
                        Globals.supabase.triggerAutomation({
                                board_id: Globals.boardId,
                                field_id: entry.field_id,
                                value: entry.value,
                                id: entry.id,
                                index: entry.index,
                        } as Entry, [AutomationId.ButtonPress])
                                .then((triggered) => triggered ? showToast("avtomatizacija uspešno sprožena") : null)
                                .catch((e) => showToast(`Avtomatizacija neuspešna ${e.message || e}`, "error"));
                }, 250);
        }, { signal: controller.signal });

        btn.addEventListener("dblclick", () => {
                controller.abort();
                controller = new AbortController();
                span.contentEditable = "true";
                span.focus();
        });
}

export async function buttonEntryBlur(ev: Event, entry: Entry) {
        const span = ev.target as HTMLSpanElement;

        const sameFieldSpans = document.querySelectorAll(`div[data-field-id="${entry.field_id}"] span`) as NodeListOf<HTMLSpanElement>;
        for (const fieldSpan of sameFieldSpans) {
                if (fieldSpan == span) continue;
                fieldSpan.innerText = span.innerText;
        }

        const field = Globals.fields.get(entry.field_id!);
        if (!field?.fieldHelpers) {
                const fieldHelper = await Globals.supabase.insertFieldHelper({
                        value: span.textContent ?? "",
                        field_id: entry.field_id,
                } as FieldHelper);

                field!.fieldHelpers = [fieldHelper!];
        }
        else {
                const fieldHelper = field.fieldHelpers[0];
                fieldHelper.value = span.textContent ?? "";
                await Globals.supabase.updateFieldHelper(fieldHelper.value, { id: fieldHelper.id });
        }

        span.contentEditable = "false";
}

export async function entryBlur(ev: Event, entry: Entry) {
        const target = ev.target as HTMLInputElement;
        entry.value = target.value;
        try {
                await Globals.supabase.updateEntries([entry]);
        }
        catch (e) {
                alert(e);
        }
}

export function dropdownOptionSelected(optionDiv: HTMLDivElement, optionText: string | null, entry: Entry, entryDiv: HTMLDivElement) {
        if (optionDiv.classList.contains("edit")) return;

        entry.value = optionText;
        entryDiv.innerText = optionText ?? "";
        Globals.supabase.updateEntries([entry]).catch((e) => {
                alert(e);
        });

        boardElements.dropdownMenu.classList.remove("shown");
}

boardElements.cancelAddOption.addEventListener("click", () => {
        Object.assign(boardElements.dropdownMenu.querySelector("input")!, {
                value: ""
        });

        boardElements.dropdownMenu.classList.remove("add");
});

boardElements.newColumnBtn.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();

        if (boardElements.addColumnMenu.classList.contains("shown")) {
                boardElements.addColumnMenu.classList.remove("shown");
                return;
        }
        else {
                boardElements.addColumnMenu.classList.add("shown");
        }

        const buttonRect = boardElements.newColumnBtn.getBoundingClientRect();

        let horizPos: number;
        if (buttonRect.right < 1800) {
                horizPos = buttonRect.right + 10;
        }
        else {
                const columnMenuWidth = parseInt(boardElements.addColumnMenu.style.width);
                horizPos = buttonRect.left - columnMenuWidth - 10;
        }

        boardElements.addColumnMenu.style.left = horizPos + 'px';
        boardElements.addColumnMenu.style.top = buttonRect.top + 10 + window.scrollY + 'px';
});

document.addEventListener("click", (e) => {
        const columnMenu = boardElements.addColumnMenu;
        if (!columnMenu.classList.contains("shown")) return;

        const columnMenuRect = columnMenu.getBoundingClientRect();

        const outsideHorizontally = e.x < columnMenuRect.left || e.x > columnMenuRect.right;
        const outsideVertically = e.y < columnMenuRect.top || e.y > columnMenuRect.bottom;

        if (outsideHorizontally || outsideVertically) {
                columnMenu.classList.remove("shown");
        }
});

boardElements.columnCheck.addEventListener("change", () => {
        const isChecked = boardElements.columnCheck.checked;

        const entryChecks = boardElements.entryChecks;
        for (const eCheckBox of entryChecks) {
                eCheckBox.checked = isChecked;
        }

        if (!isChecked) {
                bottomToolbar.outerDiv.classList.remove("shown");
                bottomToolbar.numEntriesDiv.style.display = "none";
        }
        else {
                bottomToolbar.outerDiv.classList.add("shown");
                bottomToolbar.numEntriesDiv.innerText = `${entryChecks.length}`;
                bottomToolbar.numEntriesDiv.style.display = "flex";
        }
});


boardElements.addOptionBtn.addEventListener("click", (e) => {
        boardElements.dropdownMenu.classList.add("add");
        e.stopPropagation();
});
