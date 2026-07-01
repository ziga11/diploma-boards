import { BoardStore } from "../board-state";
import { HTML } from "./html";
import { firstDeepestNode } from "./logic";
import type { Entry } from "./types";

export function createStatusEntry(entry: Entry): HTMLDivElement {
        const div = Object.assign(document.createElement("div"), {
                className: "entry-status entry",
                title: entry.value ?? "",
                innerText: entry.value ?? ""
        });

        return div;
}

export function createButtonEntry(entry: Entry): HTMLDivElement {
        const field = BoardStore.getField(entry.field_id!);
        const fieldHelper = field?.fieldHelpers?.at(0);

        const div = Object.assign(document.createElement("div"), { className: "entry" });
        const btn = Object.assign(document.createElement("button"), {
                type: "button",
                className: "btn-entry",
                title: fieldHelper?.value ?? "",
        });

        const span = Object.assign(document.createElement("span"), { innerText: fieldHelper?.value ?? "", });

        btn.appendChild(span);
        div.appendChild(btn);
        return div;
}

export function createTextEntry(entry: Entry): HTMLInputElement {
        return Object.assign(document.createElement('input'), {
                className: "entry entry-text",
                type: entry.type!,
                value: entry.value ?? "",
                title: entry.value ?? "",
        });
}

function createOption(optionText: string): HTMLDivElement {
        const div = Object.assign(document.createElement("div"), { className: "dropdown-option", });
        div.dataset.value = optionText;

        const span = Object.assign(document.createElement("span"), {
                innerText: optionText,
                className: "dropdown-option-span",
        })

        div.append(span);
        return div;
}

export function setDropdownOptions(fieldId: string) {
        const field = BoardStore.getField(fieldId)!;

        const options = (field.fieldHelpers ?? []).map(fh => createOption(fh.value));

        const emptyOption = Object.assign(document.createElement("div"), {
                id: "empty-option",
                className: "dropdown-option",
        });
        emptyOption.dataset.value = "";
        emptyOption.innerHTML = `<span>Empty</span>`;

        options.push(emptyOption);

        HTML.dropdown.optionsContainer.replaceChildren(...options);
}

export function changeDeepestValue(elem: HTMLElement, value: string) {
        const e = firstDeepestNode(elem) as HTMLElement;

        if (e instanceof HTMLInputElement) {
                e.value = value;
                elem.title = value;
        } else {
                e.innerText = value;

                if (e instanceof HTMLSpanElement) {
                        elem.parentElement!.title = value;
                } else {
                        elem.title = value;
                }
        }
}
