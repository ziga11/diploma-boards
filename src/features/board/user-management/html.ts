const activePage = () => document.querySelector(`#page-board`) ?? document;

export const HTML = {
        get modal() { return activePage().querySelector("#add-user-modal") as HTMLDialogElement },

        addUsers: {
                get div() { return activePage().querySelector("#add-user-section") as HTMLDivElement },
                get btn() { return activePage().querySelector("#add-users-section-btn") as HTMLInputElement },
                get email() { return activePage().querySelector("#add-user-email") as HTMLInputElement },
                get finishBtn() { return activePage().querySelector("#finish-adding-user") as HTMLButtonElement },
        },
        manageUsers: {
                get div() { return activePage().querySelector("#manage-users-section") as HTMLDivElement },
                get userContainer() { return activePage().querySelector("#manage-users-section")?.querySelector(".user-container") as HTMLDivElement },
                get btn() { return activePage().querySelector("#manage-users-section-btn") as HTMLInputElement },
        },

        changeRoleDropdown: {
                get dialog() { return activePage().querySelector("#change-permission-dialog") as HTMLDialogElement },
                get menu() { return activePage().querySelector("#change-permission-dialog .permission-menu") as HTMLDialogElement }
        }
}
