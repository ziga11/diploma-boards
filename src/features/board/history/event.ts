import { historyEvents } from "./custom-events";
import { onFilterActionPress, onFilterColumnPress } from "./logic/operations";
import { HTML } from "./html";
import { HistoryWizard } from "./wizard";

let isInitialized = false;

export function initHistoryEvents() {
        if (isInitialized) return;
        isInitialized = true;

        HTML.modal.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                if (elem.className == "show-payload-container-btn") {
                        const historyItem = elem.closest(".history-item") as HTMLDivElement;
                        if (!historyItem.dataset.id) return;

                        HistoryWizard.openPayloadModal(historyItem.dataset.id);
                }
                else if (elem.classList[1] == "filter-action") {
                        onFilterActionPress(elem);
                }
                else if (elem.classList[1] == "filter-column") {
                        onFilterColumnPress(elem);
                }
        });

        window.addEventListener(historyEvents.showModal.type, () => HistoryWizard.openHistoryModal());
}
