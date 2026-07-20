import type { FieldOption } from "../fields/types";
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
        const div = Object.assign(document.createElement("div"), { className: "entry" });
        const btn = Object.assign(document.createElement("button"), {
                type: "button",
                className: "btn-entry",
                title: entry?.value,
        });

        const span = Object.assign(document.createElement("span"), { innerText: entry?.value ?? "", });

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

function createOption(option: FieldOption): HTMLDivElement {
        const div = Object.assign(document.createElement("div"), { className: "status-dropdown-option", });
        div.dataset.value = option.value;
        div.dataset.id = option.id;

        const span = Object.assign(document.createElement("span"), {
                innerText: option.value,
                className: `dropdown-option-span`,
        });

        div.append(span);
        return div;
}

export function setDropdownOptions(fhOptions: Array<FieldOption>) {
        const options = fhOptions.map(fh => createOption(fh));
        const emptyOption = Object.assign(document.createElement("div"), {
                id: "empty-option",
                className: "status-dropdown-option",
        });
        emptyOption.dataset.value = "";
        emptyOption.innerHTML = `<span>Empty</span>`;

        options.push(emptyOption);

        HTML.dropdown.optionsContainer.replaceChildren(...options);
}

export function changeDeepestValue(elem: HTMLElement, value: string, oldValue?: string) {
        const e = firstDeepestNode(elem) as HTMLElement;

        if ((e instanceof HTMLInputElement) && (!oldValue || e.value == oldValue)) {
                e.value = value;
                elem.title = value;
        } else if (!oldValue || e.innerText == oldValue) {
                e.innerText = value;
                if (e instanceof HTMLSpanElement) {
                        elem.parentElement!.title = value;
                } else {
                        elem.title = value;
                }
        }
}
