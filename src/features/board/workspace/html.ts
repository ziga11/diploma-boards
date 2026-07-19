const activePage = () => document.querySelector(`#page-board`) ?? document;

export const HTML = {
        get activePage() { return document.querySelector(`#page-board`) || document; },

        get tabTitleTag() { return document.querySelector("title") as HTMLTitleElement },
        get titleSpan() { return document.querySelector(".title-text") as HTMLSpanElement },

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
        },

        editBoard: {
                get modal() { return activePage().querySelector("#edit-board-modal") as HTMLDialogElement; },

                get colorPicker() { return activePage().querySelector('.color-picker-input') as HTMLInputElement; },

                get hexInput() { return activePage().querySelector('.color-hex-input') as HTMLInputElement; },

                get presetColors() { return activePage().querySelectorAll('.preset-color') as NodeListOf<HTMLButtonElement>; },

                get nameInput() { return activePage().querySelector(".board-name") as HTMLInputElement; },

                get updateBoard() { return activePage().querySelector("#trigger-update-board") as HTMLButtonElement; },
        }
}
