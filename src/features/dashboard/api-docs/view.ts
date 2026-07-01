import { setStateClass } from "@/core/utils/dom";
import { HTML } from "./html";
import { renderEndpoints } from "./view-utils";

export async function setActiveTab(tab: HTMLButtonElement) {
        const resource = tab.dataset.resource as string;
        renderEndpoints(resource);

        const activeTab = HTML.tabDiv.querySelector(".active") as HTMLButtonElement;
        setStateClass([tab], [activeTab], "active")
}
