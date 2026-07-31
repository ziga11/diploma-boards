import type { FieldOption } from "@/features/board/fields/types";
import type { Entry } from "../types";

export function createStatusEntry(entry: Entry, options?: Record<string, FieldOption>): HTMLDivElement {
        const val = entry.option_id && options?.[entry.option_id] ? options[entry.option_id].value : "";
        const div = Object.assign(document.createElement("div"), {
                className: "entry-status entry",
                title: val,
                innerText: val,
        });

        div.dataset.dbValue = val;
        return div;
}

export function createButtonEntry(entry: Entry, options?: Record<string, FieldOption>): HTMLDivElement {
        const div = Object.assign(document.createElement("div"), { className: "entry" });
        const val = entry.option_id && options?.[entry.option_id] ? options[entry.option_id].value : "";

        const btn = Object.assign(document.createElement("button"), {
                type: "button",
                className: "btn-entry",
                innerText: val,
        });

        div.dataset.dbValue = val;
        div.appendChild(btn);
        return div;
}

export function createTextEntry(entry: Entry): HTMLInputElement {
        const val = entry.value ?? "";
        const inp = Object.assign(document.createElement("input"), {
                className: "entry entry-text",
                type: entry.type!,
                value: val,
                title: val,
        });
        inp.dataset.dbValue = val;
        return inp;
}

export function createOption(option: FieldOption): HTMLDivElement {
        const div = Object.assign(document.createElement("div"), {
                className: "status-dropdown-option",
                innerText: option.value
        });
        div.dataset.value = option.value;
        div.dataset.id = option.id;
        return div;
}

export function firstDeepestNode(element: Element): Element {
        if (element.children.length === 0) return element;
        return firstDeepestNode(element.children[0]);
}

export function extractEntryValue(entryHTML: HTMLInputElement | HTMLDivElement): string {
        return entryHTML instanceof HTMLDivElement ? entryHTML.innerText : entryHTML.value;
}
