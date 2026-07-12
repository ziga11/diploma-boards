import { setStateClass } from "@/core/utils/dom";
import { HTML } from "./html";
import { setToolbarVisibility } from "./view";
import { entryEvents } from "../entries/custom-events";
import { bottomToolbarEvents } from "./custom-events";
import { fieldEvents } from "../fields/custom-events";
import { BoardStore } from "../board-state";

export function initBottomToolbarEvents() {
        if (BoardStore.isInitialized) return;

        HTML.deselectSelected.addEventListener("click", () => {
                const selectedEntries = document.querySelectorAll(".entry-check:checked") as NodeListOf<HTMLInputElement>;
                for (const entry of selectedEntries) {
                        entry.checked = false;
                }

                window.dispatchEvent(fieldEvents.checkChange(false));
                setStateClass([], [HTML.outerDiv], "shown");
        })

        HTML.deleteSelected.addEventListener("mouseover", () => {
                const currSvg = HTML.deleteSelected.querySelector(".bi-trash3") as SVGSVGElement;
                const newSvg = HTML.deleteSelected.querySelector(".bi-trash3-fill") as SVGSVGElement;

                setStateClass([newSvg], [currSvg], "shown");
        });

        HTML.deleteSelected.addEventListener("mouseout", () => {
                const currSvg = HTML.deleteSelected.querySelector(".bi-trash3") as SVGSVGElement;
                const newSvg = HTML.deleteSelected.querySelector(".bi-trash3-fill") as SVGSVGElement;

                setStateClass([newSvg], [currSvg], "shown");
        });

        HTML.deleteSelected.addEventListener("click", () => {
                setToolbarVisibility(false);

                window.dispatchEvent(fieldEvents.checkChange(false));
                window.dispatchEvent(entryEvents.removeSelected());
        });

        HTML.duplicateSelected.addEventListener("mouseover", () => {
                const currSvg = HTML.duplicateSelected.querySelector(".bi-layers") as SVGSVGElement;
                const newSvg = HTML.duplicateSelected.querySelector(".bi-layers-fill") as SVGSVGElement;

                setStateClass([newSvg], [currSvg], "shown");
        });

        HTML.duplicateSelected.addEventListener("mouseout", () => {
                const currSvg = HTML.duplicateSelected.querySelector(".bi-layers") as SVGSVGElement;
                const newSvg = HTML.duplicateSelected.querySelector(".bi-layers-fill") as SVGSVGElement;

                setStateClass([newSvg], [currSvg], "shown");
        });

        HTML.duplicateSelected.addEventListener("click", async () => {
                const entrySets = document.querySelectorAll(".entry-set:has(.entry-check:checked)") as NodeListOf<HTMLDivElement>;

                window.dispatchEvent(entryEvents.copyRow(entrySets));
        });

        window.addEventListener(bottomToolbarEvents.visible.type, (e: Event) => {
                const { visible, checkedCount } = (e as ReturnType<typeof bottomToolbarEvents.visible>).detail;

                setToolbarVisibility(visible, checkedCount);
        });
}
