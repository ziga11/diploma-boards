const activePage = () => document.querySelector(`#page-board`) ?? document;

export const HTML = {
        get modal() { return activePage().querySelector("#history-modal") as HTMLDialogElement },
        get filters() { return activePage().querySelector("#history-modal .filter-bar") as HTMLDialogElement },
        get list() { return activePage().querySelector("#history-modal .history-list") as HTMLDialogElement },

        get filterAction() { return activePage().querySelector(`#history-modal .filter-group[data-filter="action"]`) as HTMLDialogElement },
        get filterColumn() { return activePage().querySelector(`#history-modal .filter-group[data-filter="column"]`) as HTMLDialogElement },
        get entries() { return activePage().querySelector(".entries") as HTMLDivElement }
}
