import type { HistoryLog } from "./types";
import { HTML } from "./html";
import { BoardStore } from "../board-state";
import { setStateClass } from "@/core/utils/dom";

type ActionFilter = 'ALL' | 'INSERT' | 'UPDATE' | 'DELETE';

let activeAction: ActionFilter = 'ALL';
let activeColumn: string = 'ALL';

export function setHistoryLogs(logs: Array<HistoryLog>) {
        const filtered = logs.filter(log => {
                const actionMatch = activeAction === 'ALL' || log.action === activeAction;
                const columnMatch = activeColumn === 'ALL' || log.target_column === activeColumn;
                return actionMatch && columnMatch;
        });

        if (!filtered.length) {
                HTML.list.innerHTML = `<div class="history-empty">No changes match this filter.</div>`;
                return;
        }


        HTML.list.innerHTML = filtered.map(log => {
                const fieldName = targetFieldName(log.target_column, log.target_id);
                return `
            <div class="history-item history-item--${log.action.toLowerCase()}" data-column="${log.target_column}" data-action="${log.action}">
              <div class="history-item-meta">
                <span class="history-badge history-badge--${log.action.toLowerCase()}">${log.action}</span>
                <span class="history-column">${capitalize(log.target_column)} ${fieldName != "" ? '(Field "' + fieldName + '")' : ""}</span>
                <span class="history-date">${formatDate(log.created_at)}</span>
              </div>
              <div class="history-payload">${renderPayload(log.payload as Record<string, unknown>)}</div>
            </div>
          `}).join('');
}

export function setHistoryFilter(action: string, column: string) {
        const addHidden: Array<HTMLElement> = [];
        const removeHidden: Array<HTMLElement> = [];

        for (const child of HTML.list.children as HTMLCollectionOf<HTMLElement>) {
                const actionMatch = action === "ALL" || child.dataset.action === action.toLowerCase();
                const columnMatch = column === "ALL" || child.dataset.column === column.toLowerCase();

                if (actionMatch && columnMatch) {
                        removeHidden.push(child);
                } else {
                        addHidden.push(child);
                }
        }

        setStateClass(addHidden, removeHidden, "hidden");
}

function targetFieldName(column: string, id: string): string {
        switch (column.toLowerCase()) {
                case "entry":
                        const entryElem = HTML.entries.querySelector(`[data-entry-id="${id}"]`) as HTMLElement;
                        if (!entryElem) return "";

                        const fieldId = entryElem.dataset.fieldId;
                        if (!fieldId) return "";

                        return BoardStore.getField(fieldId)?.name ?? "";
                case "field":
                        return BoardStore.getField(id)?.name ?? "";
                case "field helper":
                        const fields = BoardStore.fields.values();
                        for (const field of fields) {
                                const fieldHelper = field.fieldHelpers?.filter(fh => fh.id == id);
                                if (!fieldHelper) continue;

                                return field.name ?? "";
                        }

                        return "";
                case "automation":
                        const aEntries = BoardStore.automations.entries();
                        for (const [key, automations] of aEntries) {
                                const automation = automations.filter(a => a.id == id);
                                if (!automation) continue;

                                const field = BoardStore.getField(key);

                                return field?.name ?? "";
                        }

                        return "";
                default:
                        return "";
        }
}
const NOISE_KEYS = new Set(['id', 'account_id', 'board_id', 'date_modified']);

function renderPayload(payload: Record<string, unknown>): string {
        const entries = Object.keys(payload).filter((key) => {
                if (NOISE_KEYS.has(key)) return false;
                if (key === 'index') return false;
                return true;
        });

        if (!entries.length) return '<span class="history-payload-empty">No tracked changes</span>';

        return entries.map(([key, value]) => `
                <div class="history-payload-row">
                        <span class="history-payload-key">${capitalize(resolveKeyLabel(key))}</span>
                        <span class="history-payload-value">${formatPayloadValue(key, value)}</span>
                </div>
        `).join('');
}

function resolveKeyLabel(key: string): string {
        if (key === 'field_id') return 'Field';
        return key.replace(/_/g, ' ');
}

function formatPayloadValue(key: string, value: unknown): string {
        if (key === 'field_id' && typeof value === 'string') {
                const field = BoardStore.getField(value);
                return field?.name ? escapeHtml(field.name) : '<span class="history-payload-empty">Unknown field</span>';
        }
        if (value === null || value === undefined || value === '') {
                return '<span class="history-payload-empty">Empty</span>';
        }
        if (typeof value === 'boolean') {
                return `<span class="history-payload-bool history-payload-bool--${value}">${value ? 'Yes' : 'No'}</span>`;
        }
        if (Array.isArray(value)) {
                if (!value.length) return '<span class="history-payload-empty">Empty</span>';
                return value.map(v => `<span class="history-payload-chip">${escapeHtml(String(v))}</span>`).join('');
        }
        if (typeof value === 'object') {
                return renderPayload(value as Record<string, unknown>);
        }
        return `<span class="history-payload-value-text">${escapeHtml(String(value))}</span>`;
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
                hour: "numeric",
                minute: "numeric",
        });
}

function escapeHtml(str: string): string {
        return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
}
