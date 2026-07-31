import { setStateClass } from "@/core/utils/dom";
import { ActionFilter, type EntryLog, type HistoryLog } from "../types";
import DOMPurify from 'dompurify';
import { capitalize, formatDate, renderPayload, targetFieldName } from "./utils";
import { HTML } from "../html";

export function appendHistoryLogs(logs: HistoryLog[]) {
        if (!logs.length) {
                HTML.list.innerHTML = `<div class="history-empty">No changes match this filter.</div>`;
                return;
        }

        const rawHTML = logs.map(renderHistoryItem).join('');

        const cleanFragment = DOMPurify.sanitize(rawHTML, {
                RETURN_DOM_FRAGMENT: true,
                ADD_ATTR: ['referrerpolicy']
        }) as DocumentFragment;

        HTML.list.appendChild(cleanFragment);
}

export function appendPayloadLogs(logs: EntryLog[]) {
        console.log(logs);

        if (!logs.length) {
                HTML.list.innerHTML = `<div class="history-empty">No changes match this filter.</div>`;
                return;
        }

        const entryElems = logs
                .map(e => `<div class="history-payload">${renderPayload(e, "")}</div>`)
                .join("");

        const cleanFragment = DOMPurify.sanitize(entryElems, {
                RETURN_DOM_FRAGMENT: true,
                ADD_ATTR: ['referrerpolicy']
        }) as DocumentFragment;

        HTML.payloadModal.appendChild(cleanFragment);
}

export function renderHistoryItem(log: HistoryLog): string {
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
        </div>`;
}

export function actionType(rawAction: string): string {
        const base = rawAction.split('-')[0].toUpperCase();
        const known = Object.values(ActionFilter) as string[];
        return known.includes(base) ? base.toLowerCase() : 'other';
}

export function setHistoryFilter(action: string, column: string) {
        addActiveStateToFilters(action, column);

        const addHidden: Array<HTMLElement> = [];
        const removeHidden: Array<HTMLElement> = [];

        for (const child of HTML.list.children as HTMLCollectionOf<HTMLElement>) {
                const actionMatch = action === "ALL" || child.dataset.action?.toUpperCase() === action.toUpperCase();
                const columnMatch = column === "ALL" || child.dataset.column?.toLowerCase() === column.toLowerCase();

                if (actionMatch && columnMatch) {
                        removeHidden.push(child);
                }
                else {
                        addHidden.push(child);
                }
        }

        setStateClass(addHidden, removeHidden, "hidden");
}

function addActiveStateToFilters(action: string, column: string) {
        const actionElems = HTML.filterAction.children;
        for (const actionElem of actionElems as HTMLCollectionOf<HTMLElement>) {
                actionElem.classList.toggle("active", actionElem.dataset.action === action);
        }

        const columnElems = HTML.filterColumn.children;
        for (const columnElem of columnElems as HTMLCollectionOf<HTMLElement>) {
                columnElem.classList.toggle("active", columnElem.dataset.column === column);
        }
}

