export const boardElements = {
        profilePicDiv: document.getElementById("profile-pic") as HTMLDivElement,
        profileImg: document.getElementById("profile-img") as HTMLImageElement,
        userBoards: document.querySelector("#user-boards") as HTMLHeadingElement,
        toastContainer: document.getElementById("toast-container") as HTMLDivElement,

        boardList: {
                div: document.querySelector(".board-list") as HTMLDivElement,
                owned: {
                        div: document.querySelector(".board-list .owned-boards") as HTMLDivElement,
                        noBoards: document.querySelector(".board-list .owned-boards .no-boards") as HTMLDivElement,
                        boardDiv: document.querySelector(".board-list .owned-boards .board-div") as HTMLDivElement
                },
                other: {
                        div: document.querySelector(".board-list .other-boards") as HTMLDivElement,
                        noBoards: document.querySelector(".board-list .other-boards .no-boards") as HTMLDivElement,
                        boardDiv: document.querySelector(".board-list .other-boards .board-div") as HTMLDivElement
                }
        },
}

export const addBoardModal = {
        colorPicker: document.getElementById('board-color-picker') as HTMLInputElement,
        hexInput: document.getElementById('color-hex-input') as HTMLInputElement,

        presetButtons: document.querySelectorAll('.preset-color') as NodeListOf<HTMLButtonElement>,

        boardName: document.getElementById("new-board-name") as HTMLInputElement,
        addBtn: document.getElementById("trigger-add-board") as HTMLButtonElement,
}

export const notificationModal = {
        div: document.getElementById("notifications-modal") as HTMLDivElement,
        body: document.querySelector("#notifications-modal .modal-body") as HTMLDivElement,
}

export const apiKeyModal = {
        modal: document.getElementById("api-keys-modal") as HTMLDivElement,
        listContainer: document.getElementById("api-keys-list") as HTMLDivElement,

        nameInput: document.getElementById("new-api-key-name") as HTMLButtonElement,
        genBtn: document.getElementById("generate-api-key") as HTMLButtonElement,
        docsBtn: document.getElementsByClassName("api-docs-link")[0] as HTMLAnchorElement,
}

export const apiDocsModal = {
        modal: document.getElementById("api-docs-modal") as HTMLDivElement,
        body: document.getElementById("api-docs-body") as HTMLDivElement,

        tabDiv: document.getElementsByClassName("api-docs-tabs")[0] as HTMLDivElement,
        tabs: document.getElementsByClassName("api-tab") as HTMLCollectionOf<HTMLButtonElement>,

        activeTab: document.querySelector(".api-tab .active") as HTMLButtonElement | undefined,
        endPoints: document.getElementById("api-docs-endpoints") as HTMLDivElement,

        baseUrlVal: document.getElementsByClassName("base-url-value")[0] as HTMLSpanElement,
        baseUrlCopy: document.getElementsByClassName("base-url-copy")[0] as HTMLButtonElement,
}
