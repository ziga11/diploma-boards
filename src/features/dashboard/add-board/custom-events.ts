export const addBoardEvents = {
        showModal: Object.assign(() => new CustomEvent("add-board-show-modal"),
                { type: "add-board-show-modal" })
}
