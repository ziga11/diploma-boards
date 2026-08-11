import { automationsToken } from "@/features/board/automations/registry";
import { fieldsToken } from "@/features/board/fields/registry";
import { MasterRegistry } from "@/features/board/master-registry";
import { HTML } from "../html";

const NOISE_KEYS = new Set(['account_id', 'board_id', 'date_modified']);

export function renderPayload(payload: Record<string, unknown>, action: string): string {
        const entries = Object.entries(payload).filter(([key]) => !NOISE_KEYS.has(key));

        if (!entries.length) return '<span class="history-payload-empty">No tracked changes</span>';

        return entries.map(([key, value]) => {
                const field = typeof value !== 'string' ? undefined :
                        MasterRegistry.get(fieldsToken).getFieldById(value);
                return `
                <div class="history-payload-row">
                    <span class="history-payload-key">${capitalize(resolveKeyLabel(key))}</span>
                    <span class="history-payload-value" title="${field ? field.id : ""}">${formatPayloadValue(key, value, action)}</span>
                </div>
        `;
        }).join('');
}

function resolveKeyLabel(key: string): string {
        if (key === 'field_id') return 'Field Name';
        return key.replace(/_/g, ' ');
}

function formatPayloadValue(key: string, value: unknown, action: string): string {
        if (key === 'entries') {

                return `
                    <button type="button" class="show-payload-container-btn">
                        <span>${value} Entries</span>
                        <span class="show-payload-arrow">→</span>
                    </button>`;
        }

        if (key === 'field_id' && typeof value === 'string') {
                const field = MasterRegistry.get(fieldsToken).getFieldById(value);
                return field?.name ? field.name : `<span class="history-payload-empty">Empty</span>`;
        }

        if (value === null || value === undefined || value === '') {
                return '<span class="history-payload-empty">Empty</span>';
        }

        if (typeof value === 'boolean') {
                return `<span class="history-payload-bool history-payload-bool--${value}">${value ? 'Yes' : 'No'}</span>`;
        }

        if (Array.isArray(value)) {
                if (!value.length) return '<span class="history-payload-empty">Empty</span>';
                return value.map(v => `<span class="history-payload-chip">${String(v)}</span>`).join('');
        }

        if (typeof value === 'object') {
                return renderPayload(value as Record<string, unknown>, action);
        }

        if (key == "Color") {
                return `<span class="history-payload-value-color"><input type="color" value="${value}" title="${value}" disabled/></span>`;
        }

        return `<span class="history-payload-value-text">${String(value)}</span>`;
}

export function capitalize(str: string): string {
        if (!str) return str;
        return str[0].toUpperCase() + str.slice(1);
}

export function formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
        });
}

export function targetFieldName(column: string, id: string): string {
        switch (column.toLowerCase()) {
                case "entry": {
                        const entryElem = HTML.entries.querySelector(`[data-entry-id="${id}"]`) as HTMLElement | null;
                        const fieldId = entryElem?.dataset.fieldId;

                        if (!fieldId) return "";
                        const field = MasterRegistry.get(fieldsToken).getFieldById(fieldId)!;

                        return field.name!;
                }
                case "field":
                        return MasterRegistry.get(fieldsToken).getFieldById(id)?.name ?? "";
                case "field options": {
                        return MasterRegistry.get(fieldsToken).getOptionById(id)?.value ?? "";
                }
                case "automation": {
                        const automation = MasterRegistry.get(automationsToken).getAutomationById(id);
                        if (!automation?.fieldId) return "";

                        return MasterRegistry.get(fieldsToken).getFieldById(automation?.fieldId)?.name ?? "";
                }
                default:
                        return "";
        }
}

export function clearPayloadList(): void {
        HTML.payloadModal.innerHTML = "";
}

export function clearHistoryList(): void {
        HTML.list.innerHTML = "";
}
