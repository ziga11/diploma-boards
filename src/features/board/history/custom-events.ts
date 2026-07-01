export const historyEvents = {
        showModal: Object.assign(
                () => new CustomEvent("history:show-modal"),
                { type: "history:show-modal" as const }
        ),
}
