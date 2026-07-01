import { HTML } from "./html";
import type { EndPoint, EndPointParam } from "./types";

let docs: Record<string, any> | null = null;
async function getDocs() {
        if (!docs) docs = await (await fetch("/assets/docs.json")).json();
        return docs!;
}

function renderParams(params: EndPointParam[]) {
        if (!params) return '';
        return `
            <div>
                <div class="api-section-label">Query Parameters</div>
                <div class="api-params">
                    ${params.map(p => `
                        <div class="api-param-row">
                            <span class="api-param-name">${p.name}</span>
                            <span class="api-param-type">${p.type}</span>
                            <span class="${p.required ? 'api-param-required' : 'api-param-optional'}">${p.required ? 'required' : 'optional'}</span>
                            <span class="api-param-desc">${p.desc}</span>
                        </div>
                    `).join('')}
                </div>
            </div>`;
}

function renderBody(body: EndPointParam[]) {
        if (!body) return '';
        return `
            <div class="api-divider"></div>
            <div>
                <div class="api-section-label">Request Body (JSON)</div>
                <div class="api-body-fields">
                    ${body.map(p => `
                        <div class="api-param-row">
                            <span class="api-param-name">${p.name}</span>
                            <span class="api-param-type">${p.type}</span>
                            <span class="${p.required ? 'api-param-required' : 'api-param-optional'}">${p.required ? 'required' : 'optional'}</span>
                            <span class="api-param-desc">${p.desc}</span>
                        </div>
                    `).join('')}
                </div>
            </div>`;
}

export async function renderEndpoints(resource: string) {
        const docs = await getDocs();
        const container = HTML.endPoints;

        container.innerHTML = docs[resource].map((ep: EndPoint, i: number) => `
        <div class="api-endpoint" id="ep-${resource}-${i}">
            <div class="api-endpoint-header">
                <span class="api-method method-${ep.method.toLowerCase()}">${ep.method}</span>
                <span class="api-endpoint-path">${ep.path}</span>
                <span class="api-endpoint-summary">${ep.summary}</span>
                <span class="api-chevron">▼</span>
            </div>
            <div class="api-endpoint-body">
                ${renderParams(ep.params)}
                ${renderBody(ep.body)}
                <div class="api-divider"></div>
                <div>
                    <div class="api-section-label">Response</div>
                    <div class="api-response-box">${ep.response}</div>
                </div>
            </div>
        </div>
    `).join('');

        container.querySelectorAll<HTMLDivElement>(".api-endpoint-header").forEach(header => {
                header.addEventListener("click", () => {
                        header.closest<HTMLDivElement>(".api-endpoint")!.classList.toggle("open");
                });
        });
}
