interface EntryState {
        isInitialized: boolean;
        rowCount: { rendered: number, all: number };
        searchQuery: string | null,
}

const state: EntryState = {
        isInitialized: false,
        rowCount: { rendered: 0, all: 0 },
        searchQuery: null,
};

export const EntryState = {
        isInitialized() { return state.isInitialized; },

        setInitalized() { state.isInitialized = true; },

        setRowCount({ rendered, all }: { rendered?: number, all?: number }) {
                state.rowCount.rendered = rendered ?? state.rowCount.rendered;
                state.rowCount.all = all ?? state.rowCount.all;
        },

        getRowCount() {
                return state.rowCount;
        },

        incrementRowCount() {
                state.rowCount.rendered += 1;
                state.rowCount.all += 1;
        },

        decrementRowCount() {
                state.rowCount.rendered -= 1;
                state.rowCount.all -= 1;
        },

        setSearchQuery(search: string) {
                state.searchQuery = search;
        },

        getSearchQuery() {
                return state.searchQuery;
        },
};
