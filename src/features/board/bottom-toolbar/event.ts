import { setStateClass } from "@/core/utils/dom";
import { HTML } from "./html";
import { setToolbarVisibility } from "./view";
import { entryEvents } from "@/features/board/entries/custom-events";
import { fieldEvents } from "@/features/board/fields/custom-events";
import { bottomToolbarEvents } from "./custom-events";

let isInitialized = false;

export function initBottomToolbarEvents() {
        if (isInitialized) return;

        isInitialized = true;
        HTML.deselectSelected.addEventListener("click", () => {
                window.dispatchEvent(entryEvents.entryCheckChangeAll(false))

                window.dispatchEvent(fieldEvents.checkChange(false));
                setStateClass([], [HTML.outerDiv], "shown");
        })

        HTML.deleteSelected.addEventListener("click", () => {
                setToolbarVisibility(false);

                window.dispatchEvent(fieldEvents.checkChange(false));
                window.dispatchEvent(entryEvents.removeSelectedRows());
        });

        HTML.duplicateSelected.addEventListener("click", async () => {
                window.dispatchEvent(entryEvents.copySelectedRows());
                HTML.deselectSelected.click();
        });

        window.addEventListener(bottomToolbarEvents.visible.type, (e: Event) => {
                const { visible, checkedCount } = (e as ReturnType<typeof bottomToolbarEvents.visible>).detail;

                setToolbarVisibility(visible, checkedCount);
        });
}
