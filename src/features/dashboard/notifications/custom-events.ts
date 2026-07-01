import type { ViewNotification } from "./types";

export const notificationEvents = {
        addNotification: Object.assign(
                (detail: ViewNotification) => new CustomEvent("notification:add", { detail }),
                { type: "notification:add" }
        ),

        showModal: Object.assign(() => new CustomEvent("notifications:show-modal"),
                { type: "notifications:show-modal" })
}
