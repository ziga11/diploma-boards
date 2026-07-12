import { getAccount } from "@/core/utils/utils";
import { fetchNotifications } from "./logic";
import { notificationElem } from "./view";
import { HTML } from "./html";
import { initNotificationEvents } from "./events";

export async function initNotifications() {
        const acc = await getAccount();
        if (!acc) return;

        const notifications = await fetchNotifications();
        const notificationElems = notifications.received.map(n => notificationElem(n));

        HTML.body.container.append(...notificationElems);

        initNotificationEvents();
}
