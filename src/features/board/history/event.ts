import DOMPurify from 'dompurify';
import { InfiniteScrollLoader, setStateClass } from "@/core/utils/dom";
import { historyEvents } from "./custom-events";
import { HTML } from "./html";
import { setHistoryFilter, addHistoryLogs, renderPayload } from "./view";
import { supabase } from "@/core/api/supabase";
import type { EntryLog, HistoryLog } from "./types";

export function initHistoryEvents() {
        HTML.filterAction.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] != "filter-btn") return;

                const activeAction = HTML.filterAction.querySelector(".active") as HTMLButtonElement;
                if (activeAction == elem) return;

                const activeColumn = HTML.filterColumn.querySelector(".active") as HTMLButtonElement;
                const action = elem!.dataset.action;
                const column = activeColumn!.dataset.column;

                setHistoryFilter(action!, column!);

                setStateClass([elem], [activeAction], "active")
        });

        HTML.filterColumn.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                if (elem.classList[0] != "filter-btn") return;

                const activeColumn = HTML.filterColumn.querySelector(".active") as HTMLButtonElement;
                if (activeColumn == elem) return;

                const activeAction = HTML.filterAction.querySelector(".active") as HTMLButtonElement;
                const action = activeAction!.dataset.action;
                const column = elem!.dataset.column;

                setHistoryFilter(action!, column!);

                setStateClass([elem], [activeColumn], "active")
        });

        HTML.list.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.className != "show-payload-container-btn") return;

                const historyItem = elem.closest(".history-item") as HTMLDivElement;

                const logId = historyItem.dataset.id;
                if (!logId) return;

                HTML.payloadModal.innerHTML = "";

                new InfiniteScrollLoader<EntryLog>({
                        fetcher: () => supabase.fetchHistoryLogEntries(logId),
                        onBatch: (entries) => {
                                const entryElems = `${entries.map(e => `<div class="history-payload">${renderPayload(e, "")}</div>`).join("")}`;

                                const cleanFragment = DOMPurify.sanitize(entryElems, { RETURN_DOM_FRAGMENT: true }) as DocumentFragment;

                                HTML.payloadModal.append(cleanFragment);
                        },
                });

                HTML.payloadModal.showModal();
        });

        window.addEventListener(historyEvents.showModal.type, async () => {
                HTML.list.innerHTML = "";
                HTML.payloadModal.innerHTML = "";

                new InfiniteScrollLoader<HistoryLog>({
                        fetcher: () => supabase.fetchHistory(),
                        onBatch: (logs) => addHistoryLogs(logs),
                });

                HTML.modal.showModal();
        });
}
