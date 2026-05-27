import { Globals } from "../../../globals";
import { setStateClass } from "../../../utils";
import { boardElements, bottomToolbar, confirmDeleteBtn, confirmLeaveBtn } from "../../types";
import { createEntryRow } from "../../utils/entry";
import { copyEntrySet } from "../../utils/toolbar";

confirmDeleteBtn.addEventListener("click", async () => {
        await Globals.supabase.deleteBoard(Globals.board!.id);
        window.location.href = "index.html"
});

confirmLeaveBtn.addEventListener("click", async () => {
        await Globals.supabase.kickCollaborator(Globals.account!.id!, Globals.board!.id);
        window.location.href = "index.html"
});

bottomToolbar.deselectSelected.addEventListener("click", () => {
        const selectedEntries = document.querySelectorAll(".entry-check:checked") as NodeListOf<HTMLInputElement>;
        for (const entry of selectedEntries) {
                entry.checked = false;
        }
        boardElements.fieldCheck.checked = false;
        bottomToolbar.outerDiv.classList.remove("shown");
        setStateClass([], [bottomToolbar.outerDiv], "shown");
});

bottomToolbar.deleteSelected.addEventListener("mouseover", () => {
        const currSvg = bottomToolbar.deleteSelected.querySelector(".bi-trash3") as SVGSVGElement;
        const newSvg = bottomToolbar.deleteSelected.querySelector(".bi-trash3-fill") as SVGSVGElement;
        setStateClass([newSvg], [currSvg], "shown");
});
bottomToolbar.deleteSelected.addEventListener("mouseout", () => {
        const currSvg = bottomToolbar.deleteSelected.querySelector(".bi-trash3") as SVGSVGElement;
        const newSvg = bottomToolbar.deleteSelected.querySelector(".bi-trash3-fill") as SVGSVGElement;
        setStateClass([newSvg], [currSvg], "shown");
});
bottomToolbar.deleteSelected.addEventListener("click", () => {
        const entryBoxesSelected = document.querySelectorAll(".entry-check:checked") as NodeListOf<HTMLInputElement>;
        const indiciesToDel: Array<number> = [];

        for (const selEntryBox of entryBoxesSelected) {
                indiciesToDel.push(Number(selEntryBox.dataset.index));
                const entrySet = selEntryBox.closest(".entry-set");
                entrySet?.remove();
        }

        bottomToolbar.outerDiv.classList.remove("shown");
        Globals.supabase.deleteEntries(Globals.board!.id, { indicies: indiciesToDel });

        boardElements.fieldCheck.checked = false;
});

bottomToolbar.duplicateSelected.addEventListener("mouseover", () => {
        const currSvg = bottomToolbar.duplicateSelected.querySelector(".bi-layers") as SVGSVGElement;
        const newSvg = bottomToolbar.duplicateSelected.querySelector(".bi-layers-fill") as SVGSVGElement;
        setStateClass([newSvg], [currSvg], "shown");
});
bottomToolbar.duplicateSelected.addEventListener("mouseout", () => {
        const currSvg = bottomToolbar.duplicateSelected.querySelector(".bi-layers") as SVGSVGElement;
        const newSvg = bottomToolbar.duplicateSelected.querySelector(".bi-layers-fill") as SVGSVGElement;
        setStateClass([newSvg], [currSvg], "shown");
});

bottomToolbar.duplicateSelected.addEventListener("click", async () => {
        const checkedEntries = document.querySelectorAll(".entry-check:checked") as NodeListOf<HTMLInputElement>;

        for (const checkedEntry of checkedEntries) {
                const entrySet = checkedEntry.closest(".entry-set") as HTMLDivElement;
                const newEntries = await copyEntrySet(entrySet, Globals.board!.id);

                await createEntryRow(newEntries);
        }
});

boardElements.fieldCheck.addEventListener("change", () => {
        const isChecked = boardElements.fieldCheck.checked;

        const entryChecks = boardElements.entryChecks;
        for (const eCheckBox of entryChecks) {
                eCheckBox.checked = isChecked;
        }

        if (!isChecked) {
                bottomToolbar.outerDiv.classList.remove("shown");
                bottomToolbar.numEntriesDiv.style.display = "none";
        }
        else if (entryChecks.length > 0) {
                bottomToolbar.outerDiv.classList.add("shown");
                bottomToolbar.numEntriesDiv.innerText = `${entryChecks.length}`;
                bottomToolbar.numEntriesDiv.style.display = "flex";
        }
});
