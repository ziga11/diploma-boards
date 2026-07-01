const activePage = () => document.querySelector(`#page-board`) ?? document;

export const HTML = {
        get activePage() { return document.querySelector(`#page-board`) || document; },

        get tabTitleTag() { return document.querySelector("title") as HTMLTitleElement },

        get container() { return activePage().querySelector(".board-container") as HTMLDivElement },

        leave: {
                get modal() { return activePage().querySelector("#leave-board-modal") as HTMLDialogElement },

                get confirm() { return activePage().querySelector("#confirm-leave") as HTMLButtonElement },

                get cancel() { return this.modal.querySelector("modal-close-btn") as HTMLButtonElement }
        },

        delete: {
                get modal() { return activePage().querySelector("#delete-board-modal") as HTMLDialogElement },

                get confirm() { return activePage().querySelector("#confirm-delete") as HTMLButtonElement },

                get cancel() { return this.modal.querySelector(".modal-close-btn") as HTMLButtonElement }
        }
}
