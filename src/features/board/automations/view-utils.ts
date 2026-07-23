import DOMPurify from 'dompurify';
import type { Field } from "../fields/types";
import { AutomationId, type Automation } from "./types";

export function createFieldOption(field: Field): HTMLDivElement {
        const automationDiv = Object.assign(document.createElement('div'), {
                className: "automation-field-div"
        });
        Object.assign(automationDiv.dataset, { fieldId: field.id });

        automationDiv.innerHTML = DOMPurify.sanitize(`
        <div class="automation-field-icon">
            ${getFieldIcon(field.type!)}
        </div>
        <div class="automation-field-info">
            <b class="automation-field-name">${field.name}</b>
            <span class="automation-field-type">${field.type}</span>
            <span class="automation-field-id" title="${field.id}">#${field.id?.slice(0, 6)}...</span>
        </div>`);

        return automationDiv;
}

function getFieldIcon(type: string): string {
        const icons: Record<string, string> = {
                status: `<i class="ti ti-list-details"></i>`,
                text: `<i class="ti ti-text-scan-2"></i>`,
                button: `<i class="ti ti-click"></i>`,
        };
        return icons[type] ?? icons.text;
}

function automationIcon(automationId: AutomationId): string {
        const icons: Record<string, string> = {
                [AutomationId.EntryChange]: `<i class="ti ti-text-scan-2"></i>`,
                [AutomationId.ButtonPress]: `<i class="ti ti-click"></i>`,
                [AutomationId.RowCreated]: `<i class="ti ti-rectangular-prism-plus"></i>`,
                [AutomationId.RowRemoved]: `<i class="ti ti-rectangular-prism-off"></i>`,
        };
        return icons[automationId]!;
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

        const type = AutomationId[automation.automation_id]
                .replace(/(?<=[a-z])(?=[A-Z])/g, ' ');

        div.innerHTML = DOMPurify.sanitize(`
                <div class="automation-entry-icon">
                    ${automationIcon(automation.automation_id)}
                </div>
                <div class="automation-entry-info">
                    <span class="automation-entry-type">${type}</span>
                    <span class="automation-entry-url"  title="${automation.url_call}">${truncateUrl(automation.url_call)}</span>
                    <span class="automation-field-id" title="${automation.field_id ?? 'Not Field Based'}">${automation.field_id ?? 'Not Field Based'}</span>
                </div>
                <button class="automation-entry-delete" aria-label="Delete automation">
                    <i class="ti ti-x"></i>
                </button>
            `);

        return div;
}
