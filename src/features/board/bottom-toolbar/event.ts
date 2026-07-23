import { setStateClass } from "@/core/utils/dom";
import { HTML } from "./html";
import { setToolbarVisibility } from "./view";
import { entryEvents } from "../entries/custom-events";
import { bottomToolbarEvents } from "./custom-events";
import { fieldEvents } from "../fields/custom-events";
import { BoardState } from "../board-state";

export function initBottomToolbarEvents() {
        if (BoardState.isInitialized) return;

        HTML.deselectSelected.addEventListener("click", () => {
                const selectedEntries = document.querySelectorAll(".entry-check:checked") as NodeListOf<HTMLInputElement>;
                for (const entry of selectedEntries) {
                        entry.checked = false;
                }

                window.dispatchEvent(fieldEvents.checkChange(false));
                setStateClass([], [HTML.outerDiv], "shown");
        })

        HTML.deleteSelected.addEventListener("click", () => {
                setToolbarVisibility(false);

                window.dispatchEvent(fieldEvents.checkChange(false));
                window.dispatchEvent(entryEvents.removeSelected());
        });

        HTML.duplicateSelected.addEventListener("click", async () => {
                const entrySets = document.querySelectorAll(".entry-set:has(.entry-check:checked)") as NodeListOf<HTMLDivElement>;

                window.dispatchEvent(entryEvents.copyRow(entrySets));
                HTML.deselectSelected.click();
        });

        window.addEventListener(bottomToolbarEvents.visible.type, (e: Event) => {
                const { visible, checkedCount } = (e as ReturnType<typeof bottomToolbarEvents.visible>).detail;

                setToolbarVisibility(visible, checkedCount);
        });
}
