import "./automations.css";
import { BoardState } from "../board-state";
import { initAutomationEvents } from "./event";
import { HTML } from "./html";
import { fetchAutomations } from "./logic";
import { createAutomation } from "./view-utils";

export async function initAutomations() {
        initAutomationEvents();

        const automations = await fetchAutomations();
        const automationsArr = automations.map(automation => createAutomation(automation));

        HTML.modify.existingAutomations.append(...automationsArr);

        BoardState.setAutomations(automations);
}
