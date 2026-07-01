const activePage = () => document.querySelector(`#page-dashboard`) ?? document;

export const HTML = {
        toolbar: {
                get profileDiv() { return activePage().querySelector("#profile-pic") as HTMLDivElement },
                get profileImg() { return activePage().querySelector("#profile-img") as HTMLImageElement },
                get userBoards() { return activePage().querySelector("#user-boards") as HTMLHeadingElement },

                notification: {
                        get btn() { return activePage().querySelector("#notifications-modal-btn") as HTMLDialogElement },

                        get svgBell() { return activePage().querySelector("#notifications-modal-btn #bell") as HTMLOrSVGImageElement },
                        get spanNewNotifications() { return activePage().querySelector("#notifications-modal-btn .icon-item-new") as HTMLSpanElement },
                },

                get addBoardModalBtn() { return activePage().querySelector("#add-board-modal-btn") as HTMLButtonElement },
                get apiModalBtn() { return activePage().querySelector("#api-modal-btn") as HTMLDialogElement },

                get addBoardModalCtaBtn() { return activePage().querySelector("#create-board-cta-btn") as HTMLButtonElement; },
        },

        boardList: {
                get div() { return activePage().querySelector(".board-list") as HTMLDivElement },
                owned: {
                        get div() { return activePage().querySelector(".board-list .owned-boards") as HTMLDivElement },
                        get noBoards() { return activePage().querySelector(".board-list .owned-boards .no-boards") as HTMLDivElement },
                        get boardDiv() { return activePage().querySelector(".board-list .owned-boards .board-div") as HTMLDivElement }
                },
                shared: {
                        get div() { return activePage().querySelector(".board-list .other-boards") as HTMLDivElement },
                        get noBoards() { return activePage().querySelector(".board-list .other-boards .no-boards") as HTMLDivElement },
                        get boardDiv() { return activePage().querySelector(".board-list .other-boards .board-div") as HTMLDivElement },
                }
        },
}
