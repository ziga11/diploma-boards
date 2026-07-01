export const HTML = {
        get activePage() { return document.querySelector(`#page-board`) ?? document; },

        get outerDiv() { return this.activePage.querySelector(".bottom-toolbar") as HTMLDivElement },

        get numEntriesDiv() { return this.activePage.querySelector(".entries-selected-div") as HTMLDivElement },

        get duplicateSelected() { return this.activePage.querySelector("#duplicate-selected-btn") as HTMLButtonElement },

        get deselectSelected() { return this.activePage.querySelector("#deselect-selected-btn") as HTMLButtonElement },

        get deleteSelected() { return this.activePage.querySelector("#delete-selected-btn") as HTMLButtonElement },
};
