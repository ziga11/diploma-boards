import { sanitizeHTML } from "@/core/utils/utils";

export function createAPIKeyElem(apiKey: ApiKey): HTMLDivElement {
        const div = Object.assign(document.createElement("div"), {
                innerHTML:
                        sanitizeHTML`<div class="api-key-row" data-key-id="${apiKey.id}">
            <span class="api-key-name">${apiKey.name}</span>
            <span class="api-key-value">${apiKey.key_preview ?? "Pending"}</span>
            <div class="api-key-actions">
                <button type="button" class="copy-key-btn api-key-btn" aria-label="Copy key">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
                    </svg>
                </button>
                <button type="button" class="remove-key-btn api-key-btn" aria-label="Remove key">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                    </svg>
                </button>
            </div>
        </div>`
        });

        div.dataset.id = `${apiKey.id}`;

        return div
}

export function updateApiKeyElem(div: HTMLDivElement, apiKey: ApiKey) {
        const apiKeyValElem = div.querySelector(".api-key-value") as HTMLSpanElement;
        apiKeyValElem.innerText = apiKey.key_preview;
}
