import { closeDialog, showToast } from "@/core/utils/dom";
import { HTML } from "./html";
import { deleteAPIKey, insertAPIKey } from "./logic";
import { createAPIKeyElem, updateApiKeyElem } from "./view";
import { apikeyCache } from "./cache";
import { apiDocsEvents } from "@/features/dashboard/api-docs/custom-events";
import { apiKeyEvents } from "./custom-events";

export function initAPIKeyEvents() {
        HTML.genBtn.addEventListener("click", async () => {
                const apiName = HTML.nameInput.value.trim();
                if (apiName.length == 0) {
                        showToast("Api name must be set", "error");
                        return;
                };

                const apiKey = { id: crypto.randomUUID(), name: apiName } as ApiKey;

                const apiKeyElem = createAPIKeyElem(apiKey);
                HTML.keysContainer.appendChild(apiKeyElem);
                HTML.nameInput.value = "";


                insertAPIKey(apiKey.id, apiKey.name)
                        .then(apiKey => updateApiKeyElem(apiKeyElem, apiKey))
                        .catch(err => {
                                showToast(`Failed to insert API key ${err}`, "error");
                                apiKeyElem.remove();
                        });
        });

        HTML.keysContainer.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] == "copy-key-btn") {
                        const row = elem.parentElement!.parentElement as HTMLDivElement;

                        const id = row.dataset.keyId;
                        if (!id) return;

                        const key = apikeyCache.get(id)?.key;
                        if (!key) return;

                        navigator.clipboard.writeText(key);
                        showToast("API Key copied", "success");
                }
                else if (elem.classList[0] == "remove-key-btn") {
                        const row = elem.parentElement!.parentElement as HTMLDivElement;

                        const id = row.dataset.keyId;
                        if (!id) return;

                        deleteAPIKey(id)
                                .then(_ => row.remove())
                                .catch(err => showToast(`Failed to delete API key ${err}`, "error"));
                }
        });

        HTML.docsBtn.addEventListener("click", () => {
                closeDialog(HTML.modal);

                window.dispatchEvent(apiDocsEvents.visible(true));
        });

        window.addEventListener(apiKeyEvents.showModal.type, () => {
                HTML.modal.showModal();
        });
}
