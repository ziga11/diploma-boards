import type { HistoryLog } from "./types";
import { HTML } from "./html";
import { BoardStore } from "../board-state";
import { setStateClass } from "@/core/utils/dom";
import DOMPurify from 'dompurify';

export enum ActionFilter {
        All = 'ALL',
        Insert = 'INSERT',
        Update = 'UPDATE',
        Delete = 'DELETE'
}

const NOISE_KEYS = new Set(['account_id', 'board_id', 'date_modified']);

let activeAction: ActionFilter = ActionFilter.All;
let activeColumn: string = 'ALL';

export function addHistoryLogs(logs: Array<HistoryLog>) {
        const filtered = logs.filter(log => {
                const actionMatch = activeAction === 'ALL' || log.action === activeAction;
                const columnMatch = activeColumn === 'ALL' || log.target_column === activeColumn;
                return actionMatch && columnMatch;
        });

        if (!filtered.length) {
                HTML.list.innerHTML = `<div class="history-empty">No changes match this filter.</div>`;
                return;
        }

        const rawHTML = filtered.map(renderHistoryItem).join('');

        const cleanFragment = DOMPurify.sanitize(rawHTML, {
                RETURN_DOM_FRAGMENT: true,
                ADD_ATTR: ['referrerpolicy']
        }) as DocumentFragment;

        HTML.list.appendChild(cleanFragment);
}

function renderHistoryItem(log: HistoryLog): string {
        const fieldName = targetFieldName(log.target_column, log.target_id);
        const actionLower = actionType(log.action);
        const displayField = fieldName ? `(${log.target_column != "field" ? "Field" : ""} "${fieldName}")` : "";

        return `
        <div class="history-item history-item--${actionLower}" data-id="${log.id}" data-column="${log.target_column}" data-action="${log.action}">
            <div class="history-item-meta">
                <img class="history-avatar" src="${log.account_avatar}" alt="${log.account_name}" title="${log.account_name}" referrerpolicy="no-referrer"/>
                <span class="history-badge history-badge--${actionLower}">${log.action}</span>
                <span class="history-column">${capitalize(log.target_column)} ${displayField}</span>
                <span class="history-date">${formatDate(log.created_at)}</span>
            </div>
            <div class="history-payload">${renderPayload(log.payload as Record<string, unknown>, log.action)}</div>
        </div>
    `;
}

export function actionType(rawAction: string): string {
        const base = rawAction.split('-')[0].toUpperCase();
        const known = Object.values(ActionFilter) as string[];
        return known.includes(base) ? base.toLowerCase() : 'other';
}

export function setHistoryFilter(action: string, column: string) {
        const addHidden: Array<HTMLElement> = [];
        const removeHidden: Array<HTMLElement> = [];

        for (const child of HTML.list.children as HTMLCollectionOf<HTMLElement>) {
                const actionMatch = action === "ALL" || child.dataset.action?.toUpperCase() === action.toUpperCase();
                const columnMatch = column === "ALL" || child.dataset.column?.toLowerCase() === column.toLowerCase();

                (actionMatch && columnMatch ? removeHidden : addHidden).push(child);
        }

        setStateClass(addHidden, removeHidden, "hidden");
}

export function renderPayload(payload: Record<string, unknown>, action: string): string {
        const entries = Object.entries(payload).filter(([key]) => !NOISE_KEYS.has(key));

        if (!entries.length) return '<span class="history-payload-empty">No tracked changes</span>';

        return entries.map(([key, value]) => {
                const field = typeof value === 'string' ? BoardStore.getField(value) : undefined;
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
                const field = BoardStore.getField(value);
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

function capitalize(str: string): string {
        if (!str) return str;
        return str[0].toUpperCase() + str.slice(1);
}

function formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
        });
}

function targetFieldName(column: string, id: string): string {
        switch (column.toLowerCase()) {
                case "entry": {
                        const entryElem = HTML.entries.querySelector(`[data-entry-id="${id}"]`) as HTMLElement | null;
                        const fieldId = entryElem?.dataset.fieldId;
                        return fieldId ? (BoardStore.getField(fieldId)?.name ?? "") : "";
                }
                case "field":
                        return BoardStore.getField(id)?.name ?? "";
                case "field options": {
                        for (const field of BoardStore.fields.values()) {
                                if (field.options?.some(fh => fh.id === id)) {
                                        return field.name ?? "";
                                }
                        }
                        return "";
                }
                case "automation": {
                        for (const [fieldId, automations] of BoardStore.automations.entries()) {
                                if (automations.some(a => a.id === id)) {
                                        return BoardStore.getField(fieldId)?.name ?? "";
                                }
                        }
                        return "";
                }
                default:
                        return "";
        }
}
