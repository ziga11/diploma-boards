export const HTML = {
        get activePage() { return document.querySelector(`#page-dashboard`) || document; },

        get modal() { return this.activePage.querySelector("#add-board-modal") as HTMLDialogElement; },

        get colorPicker() { return this.activePage.querySelector('#board-color-picker') as HTMLInputElement; },

        get hexInput() { return this.activePage.querySelector('#color-hex-input') as HTMLInputElement; },

        get presetColors() { return this.activePage.querySelectorAll('.preset-color') as NodeListOf<HTMLButtonElement>; },

        get boardName() { return this.activePage.querySelector("#new-board-name") as HTMLInputElement; },

        get addBtn() { return this.activePage.querySelector("#trigger-add-board") as HTMLButtonElement; }
};
