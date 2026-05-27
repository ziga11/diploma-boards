import { Globals } from "../../../globals";
import type { InsertBoard } from "../../../types";
import { boardElements, topToolbar } from "../../types";

boardElements.backButton.addEventListener("click", () => {
        window.location.href = "index.html"
});

topToolbar.left.boardTitle.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
                e.preventDefault();
                topToolbar.left.boardTitle.blur();
        }
});

topToolbar.left.boardTitle.addEventListener("blur", async () => {
        const newTitle = topToolbar.left.boardTitle.innerText;

        const url = new URL(window.location.href);
        url.searchParams.set("title", newTitle);

        window.history.replaceState({}, '', url);

        await Globals.supabase.updateBoard({
                id: Globals.board?.id,
                name: newTitle,
        } as InsertBoard);
});

document.addEventListener("click", (e) => {
        const fieldMenu = boardElements.addFieldBtn;
        if (!fieldMenu.classList.contains("shown")) return;

        const fieldMenuRect = fieldMenu.getBoundingClientRect();

        const outsideHorizontally = e.x < fieldMenuRect.left || e.x > fieldMenuRect.right;
        const outsideVertically = e.y < fieldMenuRect.top || e.y > fieldMenuRect.bottom;

        if (outsideHorizontally || outsideVertically) {
                fieldMenu.classList.remove("shown");
        }
});
