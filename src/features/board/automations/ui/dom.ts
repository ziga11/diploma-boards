import type { Field } from "@/features/board/fields/types";
import { HTML } from "../html";
import { AutomationsState } from "../state";
import type { Automation } from "../types";
import { AutomationsWizard } from "../wizard-state";
import { createAutomation, createFieldOption } from "./utils";

export function startCreationFlow(): void {
        AutomationsWizard.reset();
        AutomationsWizard.pushView(HTML.create.type.div);
}

export function previousDiv(): void {
        AutomationsWizard.popView();
}

export function setFieldHeaderOptions(automationType: string) {
        HTML.create.field.header.type.innerHTML = `<span>Automation Type:</span> <b>${automationType}</b>`;
}

export function clearFieldHeaderOptions() {
        HTML.create.field.header.type.innerHTML = ``;
}

export function setUrlHeaderOptions(type: string, fieldId?: string, fieldName?: string) {
        HTML.create.url.header.type.innerHTML = `<span>Automation Type:</span> <b>${type}</b>`;

        if (!fieldId) return;
        fieldName = fieldName ?? "";
        const fieldContent = fieldName.length > 0 ? `${fieldName} (#${fieldId})` : `#${fieldId}`
        HTML.create.url.header.field.innerHTML = `<span>Field:</span> <b>${fieldContent}</b>`;
}

export function clearUrlHeaderOptions() {
        HTML.create.url.header.type.innerHTML = ``;
        HTML.create.url.header.field.innerHTML = ``;
}

export function checkMenuTabBtn(isModify: boolean) {
        HTML.modify.btn.checked = isModify;
        HTML.create.btn.checked = !isModify;
}

export function showCreatedAutomations(): void {
        if (AutomationsState.anyExistingAutomations()) {
                AutomationsWizard.pushView(HTML.modify.existingAutomations);
        }
        else {
                AutomationsWizard.pushView(HTML.modify.noAutomations.div);
        }
}

export function setAutomationsView(automations: Array<Automation>): Array<HTMLDivElement> {
        const automationDivs = automations.map(automation => createAutomation(automation));
        HTML.modify.existingAutomations.replaceChildren(...automationDivs);

        return automationDivs;
}

export function addAutomationView(automation: Automation): HTMLDivElement {
        const automationDiv = createAutomation(automation);
        HTML.modify.existingAutomations.appendChild(automationDiv);

        return automationDiv;
}

export function clearUrlInput() {
        HTML.create.url.input.value = "";
}

export function hideAutomationByIdView(id?: string): HTMLDivElement | null {
        if (!id) return null;
        const existingDiv = HTML.modify.existingAutomations;

        const automationEntry = existingDiv.querySelector(`.created-board-automation[data-id="${id}"]`) as HTMLDivElement;
        if (!automationEntry) return null;

        automationEntry.style.display = "none";

        return automationEntry;
}

export function removeAutomationById(id: string) {
        const existingDiv = HTML.modify.existingAutomations;

        const automationEntry = existingDiv.querySelector(`.created-board-automation[data-id="${id}"]`) as HTMLDivElement;

        automationEntry?.remove();
}

export function removeAutomationUi(elem: HTMLDivElement): void {
        const existingDiv = HTML.modify.existingAutomations;
        elem.remove();

        if (existingDiv.children.length === 0) {
                AutomationsWizard.pushView(HTML.modify.noAutomations.div);
        }
}

export function showAutomation(elem: HTMLDivElement): void {
        elem.style.display = "flex";
        AutomationsWizard.pushView(HTML.modify.existingAutomations);
}

export function renderFieldOptions(fields: Array<Field>): void {
        const options = fields.map(field => createFieldOption(field));
        HTML.create.field.fieldsContainer.replaceChildren(...options);
}
