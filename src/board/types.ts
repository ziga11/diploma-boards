export const boardElements = {
        container: document.getElementsByClassName("board-container")[0] as HTMLDivElement,
        toastContainer: document.getElementById('toast-container') as HTMLDivElement,

        backButton: document.getElementById("back-button") as HTMLButtonElement,
        tabTitleTag: document.getElementsByTagName("title")[0] as HTMLTitleElement,


        fieldOrderIndicator: document.getElementsByClassName("field-order-indicator")[0] as HTMLDivElement,
        fieldsDiv: document.getElementsByClassName("fields")[0] as HTMLDivElement,
        entriesDiv: document.getElementsByClassName("entries")[0] as HTMLDivElement,

        entries: document.getElementsByClassName(".entry") as HTMLCollectionOf<HTMLDivElement | HTMLInputElement>,
        fields: document.getElementsByClassName("field-div") as HTMLCollectionOf<HTMLDivElement>,

        dropdownMenu: document.getElementsByClassName("dropdown-menu")[0] as HTMLDivElement,

        newFieldBtn: document.getElementsByClassName("add-field-btn")[0] as HTMLDivElement,
        addFieldBtn: document.getElementsByClassName("add-field-menu")[0] as HTMLDivElement,

        fieldCheck: document.getElementsByClassName("field-check")[0] as HTMLInputElement,
        entryChecks: document.getElementsByClassName("entry-check") as HTMLCollectionOf<HTMLInputElement>,

        colHover: document.getElementById("col-labels-div") as HTMLDivElement,
};

export const confirmDeleteBtn = document.getElementById("confirm-delete") as HTMLButtonElement;
export const confirmLeaveBtn = document.getElementById("confirm-leave") as HTMLButtonElement;

export const fieldTypes = {
        text: document.getElementById("text") as HTMLDivElement,
        date: document.getElementById("date") as HTMLDivElement,
        status: document.getElementById("status") as HTMLDivElement,
        button: document.getElementById("button") as HTMLDivElement,
};

export const topToolbar = {
        left: {
                div: document.getElementById("left-top-toolbar") as HTMLButtonElement,
                btnsDiv: document.getElementById("left-top-toolbar-btns") as HTMLButtonElement,

                boardTitle: document.getElementsByClassName("board-title")[0] as HTMLHeadingElement,

                newEntryBtn: document.getElementById("new-entry-btn") as HTMLButtonElement,
                addUserBtn: document.getElementById("add-user-btn") as HTMLButtonElement,
        },
        right: {
                div: document.getElementById("right-top-toolbar") as HTMLButtonElement,
                deleteBoardBtn: document.getElementById("delete-btn") as HTMLButtonElement,
                leaveBoardBtn: document.getElementById("leave-btn") as HTMLButtonElement,
                automationsBtn: document.getElementById("automate-btn") as HTMLInputElement,
        },

};

export const bottomToolbar = {
        outerDiv: document.getElementsByClassName("bottom-toolbar")[0] as HTMLDivElement,

        numEntriesDiv: document.getElementsByClassName("entries-selected-div")[0] as HTMLDivElement,
        duplicateSelected: document.getElementById("duplicate-selected-btn") as HTMLButtonElement,
        deselectSelected: document.getElementById("deselect-selected-btn") as HTMLButtonElement,
        deleteSelected: document.getElementById("delete-selected-btn") as HTMLButtonElement,
};

export const automationElements = {
        modal: document.getElementById("automate") as HTMLDivElement,

        closeModalBtn: document.getElementById("automate")?.getElementsByClassName("btn-close")[0] as HTMLInputElement,

        create: {
                btn: document.getElementById("create-tab") as HTMLInputElement,
                noFields: document.getElementById("automate")?.querySelector(".no-fields") as HTMLDivElement,
                type: {
                        div: document.getElementsByClassName("create-automations")[0] as HTMLDivElement,
                        options: document.getElementsByClassName("automation-option") as HTMLCollectionOf<HTMLDivElement>,
                },
                field: {
                        div: document.getElementsByClassName("field-automation-selection")[0] as HTMLDivElement,
                        back: document.getElementById("back-field-selection") as HTMLInputElement,
                        fieldsContainer: document.getElementsByClassName("automation-fields-wrap")[0] as HTMLDivElement,
                },
                url: {
                        div: document.getElementsByClassName("url-call-div")[0] as HTMLDivElement,
                        input: document.getElementById("url-call") as HTMLInputElement,
                        back: document.getElementById("back-url-call") as HTMLButtonElement,
                        finish: document.getElementById("finish-automation") as HTMLButtonElement,
                        triggerType: document.getElementById("url-call-subtitle") as HTMLButtonElement,
                },
        },
        modify: {
                noAutomations: document.getElementById("automate")?.querySelector(".no-automations") as HTMLDivElement,
                existingAutomations: document.getElementsByClassName("existing-automations")[0] as HTMLDivElement,
                btn: document.getElementById("modify-tab") as HTMLInputElement,
                createAutomationCta: document.getElementById("automate")?.getElementsByClassName("create-automation-cta")[0] as HTMLInputElement,
        },
};


export const addUserModal = {
        modal: document.getElementById("add-user-modal") as HTMLDivElement,

        addUsers: {
                div: document.getElementById("add-user-section") as HTMLDivElement,
                btn: document.getElementById("add-users-section-btn") as HTMLInputElement,
                email: document.getElementById("add-user-email") as HTMLInputElement,
                finishBtn: document.getElementById("finish-adding-user") as HTMLButtonElement,
        },
        manageUsers: {
                div: document.getElementById("manage-users-section") as HTMLDivElement,
                body: document.getElementById("manage-users-section")?.getElementsByClassName("modal-body")[0] as HTMLDivElement,
                btn: document.getElementById("manage-users-section-btn") as HTMLInputElement,
        }
}

export const editFieldModal = {
        modal: document.getElementById("field-edit-modal") as HTMLDivElement,

        fieldIdSpan: document.getElementById("field-edit-id") as HTMLSpanElement,
        fieldInput: document.getElementById("field-name-input") as HTMLInputElement,
        saveFieldName: document.getElementById("save-field-name-btn") as HTMLDivElement,
        deleteField: document.getElementById("delete-field-btn") as HTMLButtonElement,

        status: {
                section: document.getElementById("status-options-section") as HTMLDivElement,
                addOption: document.getElementById("add-status-option-section") as HTMLDivElement,
                list: document.getElementById("status-options-list") as HTMLDivElement,
                addInput: document.getElementById("new-status-option-input") as HTMLInputElement,
                addBtn: document.getElementById("add-status-option-btn") as HTMLButtonElement,
        },

        button: {
                section: document.getElementById("button-options-section") as HTMLDivElement,
                textInput: document.getElementById("button-text-input") as HTMLInputElement,
        }
}
