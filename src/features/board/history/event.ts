import { setStateClass } from "@/core/utils/dom";
import { historyEvents } from "./custom-events";
import { HTML } from "./html";
import { fetchHistory } from "./logic";
import { setHistoryFilter, setHistoryLogs } from "./view";

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

        HTML.filterColumn.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                const activeColumn = HTML.filterColumn.querySelector(".active");
                if (activeColumn == elem) return;

                setStateClass([elem], [activeColumn], "active")
        });

        window.addEventListener(historyEvents.showModal.type, async () => {
                const logs = await fetchHistory();

                setHistoryLogs(logs);

                HTML.modal.showModal();
        });
}
