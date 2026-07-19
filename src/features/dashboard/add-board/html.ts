const activePage = () => document.querySelector(`#page-dashboard`) ?? document;

export const HTML = {
        get modal() { return activePage().querySelector("#add-board-modal") as HTMLDialogElement; },

        get colorPicker() { return activePage().querySelector('.color-picker-input') as HTMLInputElement; },

        get hexInput() { return activePage().querySelector('.color-hex-input') as HTMLInputElement; },

        get presetColors() { return activePage().querySelectorAll('.preset-color') as NodeListOf<HTMLButtonElement>; },

        get boardName() { return activePage().querySelector(".new-board-name") as HTMLInputElement; },

        get addBtn() { return activePage().querySelector("#trigger-add-board") as HTMLButtonElement; }
};
