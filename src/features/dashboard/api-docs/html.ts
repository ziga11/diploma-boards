export const HTML = {
        get activePage() { return document.querySelector(`#page-dashboard`) || document; },

        get modal() { return this.activePage.querySelector("#api-docs-modal") as HTMLDialogElement },

        get body() { return this.activePage.querySelector("#api-docs-body") as HTMLDivElement },

        get tabDiv() { return this.activePage.querySelector(".api-docs-tabs") as HTMLDivElement },

        get tabs() { return this.activePage.querySelectorAll(".api-tab") as NodeListOf<HTMLButtonElement> },

        get endPoints() { return this.activePage.querySelector("#api-docs-endpoints") as HTMLDivElement },

        get baseUrl() { return this.activePage.querySelector("#base-url") as HTMLDivElement },
}
