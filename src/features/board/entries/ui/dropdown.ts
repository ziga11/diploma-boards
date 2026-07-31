import { HTML } from "../html";
import type { FieldOption } from "@/features/board/fields/types";
import { createOption } from "./utils";

export function showStatusDropdown(left: number, top: number): void {
        HTML.dropdown.menu.style.left = `${left}px`;
        HTML.dropdown.menu.style.top = `${top}px`;
        HTML.dropdown.menu.showModal();
}

export function setDropdownOptions(options: Array<FieldOption>): void {
        const optionElems = options.map(fh => createOption(fh));

        const emptyOption = Object.assign(document.createElement("div"), {
                id: "empty-option",
                className: "status-dropdown-option",
                innerText: "Empty",
        });
        emptyOption.dataset.value = "";

        HTML.dropdown.optionsContainer.replaceChildren(...optionElems, emptyOption);
}

export function hideMenu(e: MouseEvent): boolean {
        const rect = HTML.dropdown.menu.getBoundingClientRect();
        return (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
        );
}
