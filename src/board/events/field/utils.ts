import { Globals } from "../../../globals";
import type { Entry } from "../../../types";
import { setStateClass } from "../../../utils";
import { boardElements } from "../../types";
import { changeAffectedEntries } from "../../utils/entry";
import { findFieldHelper } from "../../utils/other";

function zip<T>(entries1: Array<T>, entries2: Array<T>): Array<[T, T]> {
        return entries1.map((e, i) => [e, entries2[i]] as [T, T]);
}

export async function deleteField(fieldId: number) {
        await Globals.supabase.deleteField(fieldId);

        const entriesOfField = document.querySelectorAll(`[data-field-id="${fieldId}"]`);
        entriesOfField.forEach(div => { div.remove(); });
}

export function fieldHover(ev: MouseEvent) {
        const fieldDiv = ev.target as HTMLDivElement;
        const removeBtn = fieldDiv.querySelector(".remove-field") as HTMLButtonElement;
        if (ev.type == "mouseover") {
                removeBtn.classList.add("shown");
        }
        else {
                removeBtn.classList.remove("shown");
        }
}

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
}



/* TODO: ....*/
let field: HTMLDivElement | undefined;
let currFieldRect: DOMRect | undefined;
let oldIndex: number;

export async function startFieldDrag(e: MouseEvent) {
        if ((e.target instanceof HTMLDivElement)) {
                field = e.target as HTMLDivElement;
        }
        else {
                field = (e.target! as HTMLElement).parentElement! as HTMLDivElement;
        }

        currFieldRect = field!.getBoundingClientRect();
        oldIndex = Number(field.dataset.order);
        setStateClass([field], [], "switch");

        document.addEventListener("mousemove", fieldDrag);
}

export async function endFieldDrag() {
        if (!field) return;
        document.removeEventListener("mousemove", fieldDrag);
        setStateClass([], [field], "switch");

        const newIndex = Number(field.dataset.order);
        if (oldIndex == newIndex) return;
        const fieldId = Number(field.dataset.fieldId);

        await Globals.supabase.switchFieldIndex({ boardId: Globals.board!.id, fieldId: fieldId, oldIndex: oldIndex, newIndex: newIndex });
        field = undefined;
}


export async function fieldDrag(e: MouseEvent) {
        if (!field || !currFieldRect) return;
        if (e.x >= currFieldRect.x && e.x <= currFieldRect.right) return;

        const increase = e.x > currFieldRect.right;
        const currOrder = Number(field.dataset.order);
        const otherOrder = increase ? currOrder + 1 : currOrder - 1;

        const otherField = fieldWithOrder(otherOrder);
        if (!otherField) return;

        const entries1 = entriesWithOrder(currOrder);
        const entries2 = entriesWithOrder(otherOrder);
        if (entries2.length === 0) return;

        if (increase) {
                otherField.after(field);
                for (const [e1, e2] of zip(entries1, entries2)) {
                        const [o1, o2] = [e1.dataset.order, e2.dataset.order];
                        e2.after(e1);
                        e1.dataset.order = o2;
                        e2.dataset.order = o1;
                };
        } else {
                otherField.before(field);
                for (const [e1, e2] of zip(entries1, entries2)) {
                        const [o1, o2] = [e1.dataset.order, e2.dataset.order];
                        e2.before(e1)
                        e1.dataset.order = o2;
                        e2.dataset.order = o1;
                };
        }

        field.dataset.order = String(otherOrder);
        otherField.dataset.order = String(currOrder);

        requestAnimationFrame(() => {
                currFieldRect = field!.getBoundingClientRect();
        });
}

function entriesWithOrder(order: number) {
        return Object.values(boardElements.entriesDiv.querySelectorAll(`[data-order="${order}"]`) as NodeListOf<HTMLDivElement | HTMLInputElement>);
}

function fieldWithOrder(order: number): HTMLDivElement {
        return boardElements.fieldsDiv.querySelector(`.field-div[data-order="${order}"]`) as HTMLDivElement;
}
