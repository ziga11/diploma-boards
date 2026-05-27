import { Globals } from "../globals";
import type { InsertBoard } from "../types";
import { setStateClass, showToast } from "../utils";
import { renderEndpoints } from "./api-docs";
import { addBoardModal, apiDocsModal, apiKeyModal, boardElements } from "./html";
import { addBoard, createApikeyElem, hexInputChange, updateColor } from "./utils";

boardElements.profilePicDiv.addEventListener("click", async () => {
        await Globals.supabase.signOut();
        window.location.href = "/login.html";
});

addBoardModal.colorPicker.addEventListener('input', () => updateColor(addBoardModal.colorPicker.value));

addBoardModal.hexInput.addEventListener('input', () => hexInputChange());

addBoardModal.presetButtons.forEach(button => button.addEventListener('click', function() {
        updateColor(this.dataset.color!);
}));

addBoardModal.addBtn.addEventListener("click", () => addBoard({
        account_id: Globals.account?.id,
        color: addBoardModal.hexInput.value,
        name: addBoardModal.boardName.value,
} as InsertBoard));

apiKeyModal.genBtn.addEventListener("click", async () => {
        const apiName = apiKeyModal.nameInput.value.trim();
        if (apiName.length == 0) {
                showToast("Api name must be set", boardElements.toastContainer, "error");
                return;
        };

        const apikey = await Globals.supabase.genApiKey(apiName);
        console.log(apikey);
        const apikeyElem = createApikeyElem(apikey);
        apiKeyModal.listContainer.appendChild(apikeyElem);

        apiKeyModal.nameInput.value = "";
});

apiKeyModal.docsBtn.addEventListener("click", () => {
        const apiModal = (window as any).bootstrap.Modal.getOrCreateInstance(apiKeyModal.modal);
        apiModal.hide();

        const docsModal = (window as any).bootstrap.Modal.getOrCreateInstance(apiDocsModal.modal);
        docsModal.show();
})


Object.values(apiDocsModal.tabs).forEach(tab => {
        tab.addEventListener('click', async () => {
                const activeTab = (apiDocsModal.activeTab ?? apiDocsModal.tabDiv.querySelector(".active")) as HTMLButtonElement;
                setStateClass([tab], [activeTab], "active")

                apiDocsModal.activeTab = tab;

                const resource = tab.dataset.resource as string;
                await renderEndpoints(resource);
        });
});

[apiDocsModal.baseUrlCopy, apiDocsModal.baseUrlVal].forEach(e => e.addEventListener("click", () => {
        navigator.clipboard.writeText('https://ywsumeablzezlaoiufts.supabase.co/functions/v1/v1')
        showToast("Copied URL", boardElements.toastContainer, "success");
}));
