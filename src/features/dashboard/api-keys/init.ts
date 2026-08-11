import { apikeyCache } from "./cache";
import { initAPIKeyEvents } from "./events";
import { HTML } from "./html";
import { fetchAPIKeys } from "./logic";
import { createAPIKeyElem } from "./view";

export function initAPIKeys() {

        fetchAPIKeys()
                .then(apiKeys => {
                        const apiKeyElems: HTMLDivElement[] = [];
                        for (const apiKey of apiKeys) {
                                apikeyCache.set(`${apiKey.id}`, apiKey);
                                const apiKeyElem = createAPIKeyElem(apiKey);

                                apiKeyElems.push(apiKeyElem);
                        }

                        HTML.keysContainer.append(...apiKeyElems);

                        initAPIKeyEvents();
                })
                .catch(e => console.warn(`Failed to fetch api keys ${e.message}`));
}
