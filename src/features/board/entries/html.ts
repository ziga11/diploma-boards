const activePage = () => document.querySelector(`#page-board`) ?? document;

export const HTML = {
        get entriesContainer() { return activePage().querySelector(".entries") as HTMLDivElement },
        get entriesList() { return activePage().querySelector(".entry-rows") as HTMLDivElement },
        get pinnedEntriesList() { return activePage().querySelector(".pinned-entry-rows") as HTMLDivElement },
        get entryChecks() { return activePage().querySelectorAll(".entry-check") as NodeListOf<HTMLInputElement> },

        get search() { return activePage().querySelector("#search") as HTMLInputElement },

        dropdown: {
                get menu() { return activePage().querySelector(".dropdown-menu") as HTMLDialogElement },
                get optionsContainer() { return activePage().querySelector(".dropdown-options") as HTMLDivElement },
        },
};
