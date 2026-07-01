export const userManagementEvents = {
        showModal: Object.assign(() => new CustomEvent("user-management:show-modal"),
                { type: "user-management:show-modal" })
}
