import { closeDialog, showToast } from "@/core/utils/dom";
import { HTML } from "./html";
import { setActiveTab } from "./view";
import { apiDocsEvents } from "./custom-events";

export function initAPIDocsEvents() {
        HTML.tabDiv.addEventListener("click", (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                if (elem.className != "api-tab") return;

                setActiveTab(elem as HTMLButtonElement);
        });

        HTML.baseUrl.addEventListener("click", () => {
                navigator.clipboard.writeText('https://ywsumeablzezlaoiufts.supabase.co/functions/v1/v1')
                showToast("Copied URL", "success");
        })

        window.addEventListener(apiDocsEvents.visible.type, (e: Event) => {
                const visible = (e as ReturnType<typeof apiDocsEvents.visible>).detail;

                if (visible) {
                        HTML.modal.showModal();
                } else {
                        closeDialog(HTML.modal);
                }
        });
}
