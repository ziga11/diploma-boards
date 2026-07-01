const activePage = () => document.querySelector(`#page-dashboard`) ?? document;

export const HTML = {
        get modal() { return activePage().querySelector("#notifications-modal") as HTMLDialogElement },

        body: {
                get div() { return activePage().querySelector("#notifications-modal .modal-body") as HTMLDivElement },

                get container() { return activePage().querySelector("#notifications-modal .modal-body .notificataions-container") as HTMLDivElement },
                get noNotifications() { return activePage().querySelector("#notifications-modal .modal-body .no-notifications-container") as HTMLDivElement },
        }
};
