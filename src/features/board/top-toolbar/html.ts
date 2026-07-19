const activePage = () => document.querySelector(`#page-board`) ?? document;

export const HTML = {
        get backButton() { return activePage().querySelector("#back-button") as HTMLButtonElement },

        get toolbarDiv() { return activePage().querySelector("#toolbar-board") as HTMLButtonElement },

        title: {
                get div() { return activePage().querySelector(".title-display") as HTMLButtonElement },
                get text() { return activePage().querySelector(".title-text") as HTMLSpanElement },
        },
        btns: {
                get newEntry() { return activePage().querySelector("#new-entry-btn") as HTMLButtonElement },
                get addUser() { return activePage().querySelector("#add-user-btn") as HTMLButtonElement },
                get history() { return activePage().querySelector("#history-btn") as HTMLButtonElement },
                get deleteBoardModal() { return activePage().querySelector("#delete-btn") as HTMLButtonElement },
                get leaveBoardModal() { return activePage().querySelector("#leave-btn") as HTMLButtonElement },
                get automations() { return activePage().querySelector("#automate-btn") as HTMLInputElement },
                get recover() { return activePage().querySelector("#recover-btn") as HTMLButtonElement },
        }
};
