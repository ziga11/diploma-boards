import { setStateClass } from "@/core/utils/dom";
import { HTML } from "./html";
import { automationState } from "./state";
import type { Automation } from "./types";
import { AutomationId } from "./types";
import { BoardStore } from "../board-state";
import { createAutomation, createFieldOption, } from "./view-utils";

const fieldLinker: Partial<Record<AutomationId, string>> = {
        [AutomationId.TextChange]: "text",
        [AutomationId.StatusChange]: "status",
        [AutomationId.ButtonPress]: "button",
};

export function previousDiv() {
        const active = automationState.activeDiv;
        if (!active) return;

        const index = HTML.create.order.indexOf(active);
        let prevDiv = HTML.create.order.at(index - 1);

        if (automationState.automationId! > AutomationId.ButtonPress) {
                prevDiv = HTML.create.order[0];
        }

        setDiv(prevDiv!);
}

export function setDiv(div: HTMLDivElement) {
        if (div === automationState.activeDiv) return;

        setStateClass([div], [automationState.activeDiv], "shown");

        automationState.activeDiv = div;

        const isCreate = [...HTML.create.order, HTML.create.noFields].includes(div);

        HTML.modify.btn.checked = !isCreate;
        HTML.create.btn.checked = isCreate;
}

export function addAutomations(...automations: Array<Automation>): Array<HTMLDivElement> {
        const automationDivs = automations.map(automation => createAutomation(automation));
        HTML.modify.existingAutomations.append(...automationDivs);

        return automationDivs;
}

export function hideAutomation(id: string): HTMLDivElement {
        const existingDiv = HTML.modify.existingAutomations;

        const automationEntry = existingDiv.querySelector(`.created-board-automation[data-id="${id}"]`) as HTMLDivElement;
        automationEntry.style.display = "none";

        if (existingDiv.children.length <= 1) setDiv(HTML.modify.noAutomations);

        return automationEntry;
}

export function removeAutomation(elem: HTMLDivElement) {
        const existingDiv = HTML.modify.existingAutomations;

        elem.remove();

        if (existingDiv.children.length == 0) setDiv(HTML.modify.noAutomations);
}

export function showAutomation(elem: HTMLDivElement) {
        elem.style.display = "flex";

        setDiv(HTML.modify.existingAutomations);
}

export function fillFields() {
        if (!automationState.automationId) return;

        let options = [];
        const type = fieldLinker[automationState.automationId];

        const fieldDependent = automationState.automationId <= AutomationId.ButtonPress;

        if (!fieldDependent) return;

        for (const field of Array.from(BoardStore.fields.values())) {
                if (!fieldDependent || type == field.type!) {
                        options.push(createFieldOption(field));
                }
        }

        HTML.create.field.fieldsContainer.replaceChildren(...options)
}
