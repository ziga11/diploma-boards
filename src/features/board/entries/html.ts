const activePage = () => document.querySelector(`#page-board`) ?? document;

export const HTML = {
        get entryDiv() { return activePage().querySelector(".entries") as HTMLDivElement },
        get entryChecks() { return activePage().querySelectorAll(".entry-check") as NodeListOf<HTMLInputElement> },

        dropdown: {
                get menu() { return activePage().querySelector(".dropdown-menu") as HTMLDialogElement },
                get optionsContainer() { return activePage().querySelector(".dropdown-options") as HTMLDivElement },
        },
};
