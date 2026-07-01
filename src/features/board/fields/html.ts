const activePage = () => document.querySelector(`#page-board`) ?? document;

export const HTML = {
        editModal: {
                get modal() { return activePage().querySelector("#field-edit-modal") as HTMLDialogElement },

                get idDiv() { return activePage().querySelector(".id-div") as HTMLDivElement },
                get idSpan() { return activePage().querySelector("#field-edit-id") as HTMLSpanElement },
                get title() { return activePage().querySelector("#field-edit-modal-label") as HTMLHeadingElement },
                get input() { return activePage().querySelector("#field-name-input") as HTMLInputElement },
                get deleteBtn() { return activePage().querySelector("#delete-field-btn") as HTMLButtonElement },

                status: {
                        get section() { return activePage().querySelector("#status-options-section") as HTMLDivElement },
                        get addSection() { return activePage().querySelector("#add-status-option-section") as HTMLDivElement },
                        get list() { return activePage().querySelector("#status-options-list") as HTMLDivElement },
                        get addInput() { return activePage().querySelector("#new-status-option-input") as HTMLInputElement },
                        get addBtn() { return activePage().querySelector("#add-status-option-btn") as HTMLButtonElement },
                },

                button: {
                        get section() { return activePage().querySelector("#button-options-section") as HTMLDivElement },
                        get input() { return activePage().querySelector("#button-text-input") as HTMLInputElement },
                }
        },

        get fieldCheck() { return activePage().querySelector(".field-check") as HTMLInputElement },
        get fieldsDiv() { return activePage().querySelector(".fields") as HTMLDivElement },
        get newFieldMenu() { return activePage().querySelector(".add-field-menu") as HTMLDialogElement },
        get newFieldBtn() { return activePage().querySelector(".add-field-btn") as HTMLButtonElement },
}
