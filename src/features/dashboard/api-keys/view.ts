import DOMPurify from 'dompurify';

export function createAPIKeyElem(apiKey: ApiKey): HTMLDivElement {
        const div = document.createElement("div");
        div.dataset.id = `${apiKey.id}`;

        const rawHTML = `
        <div class="api-key-row" data-key-id="${apiKey.id}">
            <span class="api-key-name">${apiKey.name}</span>
            <span class="api-key-value">${apiKey.key_preview ?? "Pending"}</span>
            <div class="api-key-actions">
                <button type="button" class="copy-key-btn api-key-btn" aria-label="Copy key">
                    <i class="ti ti-copy"></i>
                </button>
                <button type="button" class="remove-key-btn api-key-btn" aria-label="Remove key">
                    <i class="ti ti-trash-x"></i>
                </button>
            </div>
        </div>
    `;

        div.innerHTML = DOMPurify.sanitize(rawHTML);
        return div;
}
export function updateApiKeyElem(div: HTMLDivElement, apiKey: ApiKey) {
        const apiKeyValElem = div.querySelector(".api-key-value") as HTMLSpanElement;
        apiKeyValElem.innerText = apiKey.key_preview;
}
