import "./automations.css"
import { createToken, MasterRegistry } from "@/features/board/master-registry";
import { initAutomationEvents } from "./event";
import { AutomationsState } from "./state";
import type { AutomationModuleInterface } from "./types";
import { fetchAutomations } from "./logic";
import { setAutomationsView } from "./ui/dom";

const publicInterface: AutomationModuleInterface = {
        getAutomationById: (id) => AutomationsState.getAutomaton(id),
        removeAutomationById: (id) => AutomationsState.removeAutomation(id),
};

export const automationsToken = createToken<AutomationModuleInterface>("automations");

export const AutomationsRegistry = {
        async init(): Promise<void> {
                const automations = await fetchAutomations();

                AutomationsState.setAutomations(automations);
                setAutomationsView(automations);

                if (!AutomationsState.isInitialized()) {
                        MasterRegistry.register(automationsToken, publicInterface);
                        initAutomationEvents();

                        AutomationsState.setInitalized();
                }
        },

        destroy(): void {
                AutomationsState.clear();
        }
};
