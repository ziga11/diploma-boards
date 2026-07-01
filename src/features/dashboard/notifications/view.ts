import type { ViewNotification } from "./types";

function notificationHead(acc: Account): HTMLDivElement {
        const headDiv = Object.assign(document.createElement("div"), { className: "notification-head-div" });

        const headInfoDiv = Object.assign(document.createElement("div"), { className: "notification-head-info" });

        const dismissBtn = Object.assign(document.createElement("button"), { className: "notification-dismiss-btn notification-action-btn btn-close" });
        dismissBtn.dataset.state = "dismissed"

        const username = Object.assign(document.createElement("h5"), { innerText: acc.name, className: "notification-name" });
        const img = Object.assign(document.createElement("img"), {
                src: acc.avatar_url,
                className: "notification-img",
                referrerPolicy: "no-referrer"
        });

        headInfoDiv.append(img, username);

        headDiv.append(headInfoDiv, dismissBtn);

        return headDiv;
}

function notificationBody(message: string) {
        const div = Object.assign(document.createElement("div"), { className: "notification-body" });

        const msgBoardInd = message.indexOf("board");
        const msg = `${message.substring(0, msgBoardInd)}`

        const pElem = Object.assign(document.createElement("p"), { textContent: msg, className: "notification-message" });
        const boardName = Object.assign(document.createElement("b"), { textContent: message.substring(msgBoardInd) })

        pElem.appendChild(boardName);
        div.appendChild(pElem);

        return div;
}

function notificationFooter(): HTMLDivElement {
        const div = Object.assign(document.createElement("div"), { className: "notifications-buttons-div" });

        const acceptBtn = Object.assign(document.createElement("button"), {
                type: "button",
                className: "notification-action-btn notification-accept-btn",
                innerText: "Accept",
        });
        acceptBtn.dataset.state = "accepted"

        const declineBtn = Object.assign(document.createElement("button"), {
                type: "button",
                className: "notification-action-btn notification-decline-btn",
                innerText: "Decline",
        });
        declineBtn.dataset.state = "declined"

        div.append(acceptBtn, declineBtn);
        return div;
}

export function notificationElem(n: ViewNotification): HTMLDivElement {
        const div = Object.assign(document.createElement("div"), { className: "notification-div" });
        div.dataset.id = n.id;

        const headDiv = notificationHead(n.from_acc);

        const divider = Object.assign(document.createElement("div"), { className: "notification-divider" });

        const bodyDiv = notificationBody(n.message);
        const footerDiv = notificationFooter();

        div.append(headDiv, divider, bodyDiv, divider, footerDiv);

        return div;
}
