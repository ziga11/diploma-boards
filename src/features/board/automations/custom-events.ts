import type { Automation } from "./types";

export const automationEvents = {
        showModal: Object.assign(() => new CustomEvent("automations:show-modal"),
                { type: "automations:show-modal" }),

        removeAutomation: Object.assign(
                (detail: string) => new CustomEvent("automations:remove", { detail }),
                { type: "automations:remove" }),

        addAutomation: Object.assign(
                (detail: Automation) => new CustomEvent("automations:add", { detail }),
                { type: "automations:add" })
}
