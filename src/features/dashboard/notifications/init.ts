import { fetchNotifications } from "./logic";
import { notificationElem } from "./view";
import { HTML } from "./html";
import { initNotificationEvents } from "./events";
import { supabase } from "@/core/api/supabase";

export async function initNotifications() {
        const acc = await supabase.getAccount();
        if (!acc) return;

        const notifications = await fetchNotifications();
        const notificationElems = notifications.received.map(n => notificationElem(n));

        HTML.body.container.append(...notificationElems);

        initNotificationEvents();
}
