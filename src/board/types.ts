export const boardElements = {
        container: document.getElementsByClassName("board-container")[0] as HTMLDivElement,
        toastContainer: document.getElementById('toast-container') as HTMLDivElement,

        backButton: document.getElementById("back-button") as HTMLButtonElement,
        tabTitleTag: document.getElementsByTagName("title")[0] as HTMLTitleElement,

        boardHeadTitle: document.getElementsByClassName("board-title")[0] as HTMLHeadingElement,

        columnsDiv: document.getElementsByClassName("columns")[0] as HTMLDivElement,
        entries: document.getElementsByClassName("entries")[0] as HTMLDivElement,

        confirmDeleteBtn: document.getElementById("confrim-delete") as HTMLButtonElement,

        addOptionBtn: document.getElementById("add-option") as HTMLDivElement,


        dropdownMenu: document.getElementsByClassName("dropdown-menu")[0] as HTMLDivElement,
        addOptionDiv: document.getElementById("add-option-div") as HTMLDivElement,
        confirmAddOption: document.getElementById("confirm-add-option-div") as HTMLDivElement,
        cancelAddOption: document.getElementById("cancel-add-option-div") as HTMLDivElement,

        newEntryBtn: document.getElementById("new-entry-btn") as HTMLButtonElement,
        newColumnBtn: document.getElementsByClassName("add-column-btn")[0] as HTMLDivElement,
        addColumnMenu: document.getElementsByClassName("add-column-menu")[0] as HTMLDivElement,

        columnCheck: document.getElementsByClassName("column-check")[0] as HTMLInputElement,
        entryChecks: document.getElementsByClassName("entry-check") as HTMLCollectionOf<HTMLInputElement>,

        colHover: document.getElementById("col-labels-div") as HTMLDivElement,
};

export const columnTypes = {
        text: document.getElementById("text") as HTMLDivElement,
        date: document.getElementById("date") as HTMLDivElement,
        status: document.getElementById("status") as HTMLDivElement,
        button: document.getElementById("button") as HTMLDivElement,
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
        openModalBtn: document.getElementById("automate-btn") as HTMLInputElement,

        createTab: document.getElementById("create-tab") as HTMLInputElement,
        modifyTab: document.getElementById("modify-tab") as HTMLInputElement,

        automationOptions: document.getElementsByClassName("automation-option") as HTMLCollectionOf<HTMLDivElement>,

        createAutomations: document.getElementsByClassName("create-automations")[0] as HTMLDivElement,
        createdAutomations: document.getElementsByClassName("existing-automations")[0] as HTMLDivElement,
        fieldSelection: document.getElementsByClassName("field-automation-selection")[0] as HTMLDivElement,

        urlCallDiv: document.getElementsByClassName("url-call-div")[0] as HTMLDivElement,
        urlCallInput: document.getElementById("url-call") as HTMLInputElement,

        finishAutomation: document.getElementById("finish-automation") as HTMLButtonElement,
        backUrlCall: document.getElementById("back-url-call") as HTMLButtonElement,
};


export const addUserModal = {
        triggeringBtn: document.getElementById("add-user-btn") as HTMLButtonElement,

        modal: document.getElementById("add-user-modal") as HTMLDivElement,

        addUsers: {
                div: document.getElementById("add-user-section") as HTMLDivElement,
                btn: document.getElementById("add-users-section-btn") as HTMLInputElement,
                email: document.getElementById("add-user-email") as HTMLInputElement,
                permission: document.getElementById("add-user-permission") as HTMLSelectElement,
                finishBtn: document.getElementById("finish-adding-user") as HTMLButtonElement,
        },
        manageUsers: {
                div: document.getElementById("manage-users-section") as HTMLDivElement,
                btn: document.getElementById("manage-users-section-btn") as HTMLInputElement,
        }
}
