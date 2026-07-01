export const apiKeyEvents = {
        showModal: Object.assign(() => new CustomEvent("api-keys:show-modal"),
                { type: "api-keys:show-modal" })
}
