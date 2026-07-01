export const automationEvents = {
        showModal: Object.assign(() => new CustomEvent("automations:show-modal"),
                { type: "automations:show-modal" })
}
