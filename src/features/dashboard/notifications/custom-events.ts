import type { ViewNotification } from "./types";

export const notificationEvents = {
        addNotification: Object.assign(
                (detail: ViewNotification) => new CustomEvent("notification:add", { detail }),
                { type: "notification:add" }
        ),

        removeNotification: Object.assign(
                (detail: string) => new CustomEvent("notification:remove", { detail }),
                { type: "notification:remove" }
        ),

        showModal: Object.assign(() => new CustomEvent("notifications:show-modal"),
                { type: "notifications:show-modal" })
}
