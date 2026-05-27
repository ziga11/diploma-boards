import { Globals } from "../../globals";
import { AutomationId, type Automation, type Field } from "../../types";
import { setStateClass } from "../../utils";
import { deleteAutomation } from "../events/automation/utils";
import { automationElements } from "../types";

export function setAutomationSection(section: HTMLDivElement | null) {
        automationElements.create.type.div.classList.remove("shown");
        automationElements.create.field.div.classList.remove("shown");
        automationElements.create.url.div.classList.remove("shown");
        automationElements.modify.existingAutomations.classList.remove("shown");

        if (section)
                section.classList.add("shown");
}

export function createAutomationSelectionOption(field: Field): HTMLDivElement {
        const automationDiv = Object.assign(document.createElement('div'), {
                className: "automation-field-div"
        });
        Object.assign(automationDiv.dataset, { fieldId: field.id });

        automationDiv.innerHTML = `
        <div class="automation-field-icon">
            ${getFieldIcon(field.type!)}
        </div>
        <div class="automation-field-info">
            <b class="automation-field-name">${field.name}</b>
            <span class="automation-field-type">${field.type}</span>
        </div>
    `;

        automationDiv.addEventListener("click", () => {
                setStateClass(
                        [automationElements.create.url.div],
                        [automationElements.create.field.div, automationElements.create.type.div, automationElements.modify.existingAutomations],
                        "shown"
                );
                Globals.selectedFieldId = field.id;
        });

        return automationDiv;
}

function getFieldIcon(type: string): string {
        const icons: Record<string, string> = {
                status: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 18m-2 0a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M18 6m-2 0a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M6 12h5.5a2.5 2.5 0 0 1 0 5h-.5" /><path d="M18 12h-5.5a2.5 2.5 0 0 1 0 -5h.5" /></svg>`,
                text: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /></svg>`,
                button: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>`,
        };
        return icons[type] ?? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>`;
}

export function createAutomation(automation: Automation): HTMLDivElement {
        const div = Object.assign(document.createElement('div'), {
                className: "board-automation-option",
        });

        div.innerHTML = `
        <div class="automation-entry-icon">
            ${getFieldIcon(AutomationId[automation.automation_id])}
        </div>
        <div class="automation-entry-info">
            <span class="automation-entry-type">${AutomationId[automation.automation_id]}</span>
            <span class="automation-entry-url" title="${automation.url_call}">${truncateUrl(automation.url_call)}</span>
        </div>
        <button class="automation-entry-delete" aria-label="Delete automation">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M18 6l-12 12" />
                <path d="M6 6l12 12" />
            </svg>
        </button>
    `;

        div.querySelector('.automation-entry-delete')!
                .addEventListener('click', () => deleteAutomation(div, automation));

        return div;
}

function truncateUrl(url: string, max = 28): string {
        try {
                const { hostname, pathname } = new URL(url);
                const short = hostname + pathname;
                return short.length > max ? short.slice(0, max) + '…' : short;
        } catch {
                return url.length > max ? url.slice(0, max) + '…' : url;
        }
}


export async function fillExistingAutomations() {
        const automations = await Globals.supabase.fetchFieldAutomations(Globals.board!.id);
        automationElements.modify.existingAutomations.innerHTML = "";

        automations.forEach((automation: Automation) => {
                const automationDiv = createAutomation(automation);
                automationElements.modify.existingAutomations.appendChild(automationDiv);
        });
}

