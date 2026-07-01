import { getAccount } from "@/core/utils/utils";
import { fetchNotifications } from "./logic";
import { notificationElem } from "./view";
import { HTML } from "./html";
import { initNotificationEvents } from "./events";
import { dashboardEvents } from "../workspace/custom-events";
import { setStateClass } from "@/core/utils/dom";

export async function initNotifications() {
        const acc = await getAccount();
        if (!acc) return;

        const notifications = await fetchNotifications();
        const notificationElems = notifications.received.map(n => notificationElem(n));

        if (notifications.received.length > 0) {
                window.dispatchEvent(dashboardEvents.showNewNotifications(true));
                HTML.body.container.append(...notificationElems);
        } else {
                setStateClass([HTML.body.noNotifications], [HTML.body.container], "shown");
        }


        initNotificationEvents();
}
