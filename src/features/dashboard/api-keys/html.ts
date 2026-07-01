export const HTML = {
        get activePage() { return document.querySelector(`#page-dashboard`) || document },

        get modal() { return this.activePage.querySelector("#api-keys-modal") as HTMLDialogElement },

        get keysContainer() { return this.activePage.querySelector("#api-keys-list") as HTMLDivElement },

        get nameInput() { return this.activePage.querySelector("#new-api-key-name") as HTMLButtonElement },

        get genBtn() { return this.activePage.querySelector("#generate-api-key") as HTMLButtonElement },

        get docsBtn() { return this.activePage.querySelector(".api-docs-link") as HTMLAnchorElement },
};
