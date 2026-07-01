import { showToast } from "@/core/utils/dom";
import { HTML } from "./html";
import { fetchBoard, setNotificationState } from "./logic";
import { dashboardEvents } from "../workspace/custom-events";
import { notificationEvents } from "./custom-events";
import { notificationElem } from "./view";

export function initNotificationEvents() {
        HTML.body.container.addEventListener("click", async (e: MouseEvent) => {
                const elem = e.target as HTMLElement;
                console.log(elem);
                if (elem.classList[0] != "notification-action-btn") return;

                const notificationDiv = elem.closest(".notification-div") as HTMLDivElement;

                console.log(notificationDiv);

                const nId = notificationDiv.dataset.id;
                if (!nId) return;

                const state = elem.dataset.state;
                try {
                        const id = crypto.randomUUID();
                        console.log(id, nId, state!);

                        const boardId = await setNotificationState(id, nId, state!);
                        console.log(boardId);

                        if (elem.classList[1] != "notification-accept-btn") return;
                        const board = await fetchBoard(boardId);

                        window.dispatchEvent(dashboardEvents.addMultipleBoards({ boards: [board], type: "shared" }));

                        notificationDiv.remove();
                        if (HTML.body.container.children.length == 0) {
                                window.dispatchEvent(dashboardEvents.showNewNotifications(false));
                        }
                }
                catch (error) {
                        console.warn(error);

                        showToast(`${error}`, "error");
                }
        });

        window.addEventListener(notificationEvents.showModal.type, () => HTML.modal.showModal());

        window.addEventListener(notificationEvents.addNotification.type, (e: Event) => {
                const notification = (e as ReturnType<typeof notificationEvents.addNotification>).detail;

                const notificationHTML = notificationElem(notification);
                HTML.body.container.appendChild(notificationHTML);
        })
}
