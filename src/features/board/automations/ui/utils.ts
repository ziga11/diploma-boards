import DOMPurify from 'dompurify';
import { AutomationType, type Automation } from "../types";
import type { Field } from '@/features/board/fields/types';
import { HTML } from '../html';
import { automationTypeToString } from '../logic';

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
            <span class="automation-field-id">#${field.id?.slice(0, 6)}...</span>
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

function automationIcon(type: AutomationType): string {
        const icons: Record<string, string> = {
                [AutomationType.EntryChange]: `<i class="ti ti-text-scan-2"></i>`,
                [AutomationType.ButtonPress]: `<i class="ti ti-click"></i>`,
                [AutomationType.RowCreated]: `<i class="ti ti-rectangular-prism-plus"></i>`,
                [AutomationType.RowRemoved]: `<i class="ti ti-rectangular-prism-off"></i>`,
        };
        return icons[type]!;
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

        const type = automationTypeToString(automation.type);

        div.innerHTML = DOMPurify.sanitize(`
                <div class="automation-entry-icon">
                    ${automationIcon(automation.type)}
                </div>
                <div class="automation-entry-info">
                    <span class="automation-entry-type">${type}</span>
                    <span class="automation-entry-url"  title="${automation.urlCall}">${truncateUrl(automation.urlCall)}</span>
                    <span class="automation-field-id" title="${automation.fieldId ?? 'Not Field Based'}">${automation.fieldId ?? 'Not Field Based'}</span>
                </div>
                <button class="automation-entry-delete" aria-label="Delete automation">
                    <i class="ti ti-x"></i>
                </button>
            `);

        return div;
}

export function getVisibleAutomationsCount(): number {
        const existingDiv = HTML.modify.existingAutomations;
        const visible = Array.from(existingDiv.children).filter(
                child => (child as HTMLElement).style.display !== "none"
        );

        return visible.length;
}

