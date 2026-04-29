export function showToast(message: string, toastContainer: HTMLDivElement, type: 'success' | 'error' = 'success') {
        const toast = document.createElement('div');

        const innerHTML = `
        <span>${message}</span>
        <span style="margin-right: 15px; cursor: pointer; opacity: 0.7;" onclick="this.parentElement.remove()">✕</span>`;

        Object.assign(toast, {
                className: `toast ${type}`,
                innerHTML: innerHTML,
        });

        Object.assign(toast.style, {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
        });

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
