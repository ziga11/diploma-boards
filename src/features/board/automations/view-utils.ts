import { sanitizeHTML } from "@/core/utils/utils";
import type { Field } from "../fields/types";
import { AutomationId, type Automation } from "./types";

export function createFieldOption(field: Field): HTMLDivElement {
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
            <span class="automation-field-id" title="${field.id?.slice(0, 6)}">#${field.id?.slice(0, 6)}...</span>
        </div>
    `;

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

function truncateUrl(url: string, max = 28): string {
        try {
                const { hostname, pathname } = new URL(url);
                const short = hostname + pathname;
                return short.length > max ? short.slice(0, max) + '…' : short;
        } catch {
                return url.length > max ? url.slice(0, max) + '…' : url;
        }
}

export function createAutomation(automation: Automation): HTMLDivElement {
        const div = Object.assign(document.createElement('div'), { className: "created-board-automation", });
        div.dataset.id = `${automation.id}`;

        div.innerHTML = `
        <div class="automation-entry-icon">
            ${getFieldIcon(AutomationId[automation.automation_id])}
        </div>
        ${sanitizeHTML`<div class="automation-entry-info">
            <span class="automation-entry-type">${AutomationId[automation.automation_id]}</span>
            <span class="automation-entry-url"  title="${automation.url_call}">${truncateUrl(automation.url_call)}</span>
            <span class="automation-field-id" title=${automation.field_id}>${automation.field_id?.slice(0, 6)}...</span>
        </div>`}
        <button class="automation-entry-delete" aria-label="Delete automation">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M18 6l-12 12" />
                <path d="M6 6l12 12" />
            </svg>
        </button>
    `;

        return div;
}
