import { toastContainer } from "@/features/global-html";

export function setStateClass(addTo: Array<Element | null | undefined>, removeFrom: Array<Element | null | undefined>, state: string) {
        addTo.filter((elem): elem is Element => elem != null).forEach((elem) => {
                elem.classList.add(state);
        });
        removeFrom.filter((elem): elem is Element => elem != null).forEach((elem) => {
                elem.classList.remove(state);
        });
}

export function showToast(message: string, type: 'success' | 'error' = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast.${type}`;

        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;

        const closeButton = document.createElement('span');
        closeButton.textContent = '✕';
        closeButton.addEventListener('click', () => {
                toast.remove();
        });

        Object.assign(closeButton.style, {
                marginLeft: '15px',
                cursor: 'pointer',
                opacity: '0.7'
        });

        Object.assign(toast.style, {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
        });
        toast.append(messageSpan, closeButton);

        if (toastContainer) {
                toastContainer.appendChild(toast);
        } else {
                console.error("Toast container missing in boardElements!");
        }

        setTimeout(() => {
                toast.classList.add('toast-exit');
                toast.addEventListener('animationend', () => toast.remove());
        }, 4000);
}

export function closeDialog(dialog: HTMLDialogElement) {
        dialog.classList.add("closing");
        dialog.addEventListener("animationend", () => {
                dialog.classList.remove("closing");
                dialog.close();
        }, { once: true });
}

export function initToastLayerManagement() {
        const originalParent = toastContainer.parentElement || document.body;

        const observer = new MutationObserver(() => {
                const activeDialog = document.querySelector('dialog[open]');

                if (activeDialog) {
                        if (toastContainer.parentElement !== activeDialog) {
                                activeDialog.appendChild(toastContainer);
                        }
                } else {
                        if (toastContainer.parentElement !== originalParent) {
                                originalParent.appendChild(toastContainer);
                        }
                }
        });

        observer.observe(document.body, {
                attributes: true,
                subtree: true,
                attributeFilter: ['open']
        });
}
