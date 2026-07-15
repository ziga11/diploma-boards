import { showToast } from "@/core/utils/dom";
import { HTML } from "./html";
import { fetchBoard, setNotificationState } from "./logic";
import { dashboardEvents } from "../workspace/custom-events";
import { notificationEvents } from "./custom-events";
import { notificationElem } from "./view";

export function initNotificationEvents() {
        HTML.body.container.addEventListener("click", async (e: MouseEvent) => {
                const elem = e.target as HTMLElement;

                if (elem.classList[0] != "notification-action-btn") return;

                const notificationDiv = elem.closest(".notification-div") as HTMLDivElement;

                const nId = notificationDiv.dataset.id;
                if (!nId) return;

                const state = elem.dataset.state;
                try {
                        const id = crypto.randomUUID();

                        const boardId = await setNotificationState(id, nId, state!);

                        if (elem.classList[1] != "notification-accept-btn") {
                                notificationDiv.remove();
                                return;
                        }
                        const board = await fetchBoard(boardId);

                        window.dispatchEvent(dashboardEvents.addMultipleBoards({ boards: [board], type: "shared" }));

                        notificationDiv.remove();
                }
                catch (error) {
                        console.warn(error);

                        showToast(`${error}`, "error");
                }
        });

        window.addEventListener(notificationEvents.showModal.type, () => HTML.modal.showModal());

        window.addEventListener(notificationEvents.addNotification.type, (e: Event) => {
                const notification = (e as ReturnType<typeof notificationEvents.addNotification>).detail;

                showToast(`New Notification received: ${notification.message}`)

                const notificationHTML = notificationElem(notification);
                HTML.body.container.appendChild(notificationHTML);
        });

        window.addEventListener(notificationEvents.removeNotification.type, (e: Event) => {
                const id = (e as ReturnType<typeof notificationEvents.removeNotification>).detail;

                const elem = HTML.body.container.querySelector(`.notification-div[data-id="${id}"]`) as HTMLElement;
                elem?.remove();
        })
}
