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

export class InfiniteScrollLoader<T> {
        private observer: IntersectionObserver;
        private sentinelEl: HTMLElement | null = null;
        private isFetching = false;
        private gen!: AsyncGenerator<T[]>;
        private allLoaded = false;

        private fetcher: () => AsyncGenerator<T[]>;
        private onBatch: (...args: T[][]) => void;

        constructor({ fetcher, onBatch }: {
                fetcher: () => AsyncGenerator<T[]>;
                onBatch: (...args: T[][]) => void;
        }) {
                this.fetcher = fetcher;
                this.onBatch = onBatch;

                this.observer = new IntersectionObserver(
                        (entries) => {
                                if (entries[0].isIntersecting) {
                                        this.loadNextBatch();
                                }
                        },
                        { rootMargin: '0px', threshold: 0 }
                );

                this.reset();
        }

        setSentinel(el: HTMLElement | null) {
                if (this.sentinelEl) this.observer.unobserve(this.sentinelEl);
                this.sentinelEl = el;
                if (el) this.observer.observe(el);
        }

        public async reset(beforeBatch?: () => void) {
                this.gen = this.fetcher();
                this.allLoaded = false;
                this.isFetching = false;

                await this.loadNextBatch(beforeBatch);
        }

        private async loadNextBatch(beforeBatch?: () => void) {
                if (this.isFetching || this.allLoaded) return;
                this.isFetching = true;

                try {
                        const { value, done } = await this.gen.next();
                        if (done || !value) {
                                this.allLoaded = true;
                        } else {
                                if (beforeBatch) {
                                        beforeBatch();
                                }
                                this.onBatch(value);
                        }
                } catch (err) {
                        console.error('InfiniteScrollLoader: fetch failed', err);
                } finally {
                        this.isFetching = false;
                }
        }

        destroy() {
                this.observer.disconnect();
        }
}
