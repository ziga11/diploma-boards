const activePage = () => document.querySelector(`#page-board`) ?? document;

export const HTML = {
        get backButton() { return activePage().querySelector("#back-button") as HTMLButtonElement },

        title: {
                get div() { return activePage().querySelector(".title-display") as HTMLButtonElement },
                get text() { return activePage().querySelector(".title-text") as HTMLSpanElement },
                icons: {
                        get div() { return activePage().querySelector(".title-display .icons") as HTMLButtonElement },
                        edit: {
                                get div() { return activePage().querySelector(".edit-title-icons") as HTMLDivElement },
                                get confirm() { return activePage().querySelector(".edit-title-icons .confirm-button") as HTMLButtonElement }
                        },
                        hover: {
                                get div() { return activePage().querySelector(".hover-title-icons") as HTMLButtonElement }
                        },
                },
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
