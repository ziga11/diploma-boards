import { supabase } from "@/core/api/supabase";
import type { Entry } from "./types";
import { MasterRegistry } from "@/features/board/master-registry";
import { EntryState } from "./state";
import { InfiniteScrollLoader } from "@/core/utils/dom";
import { fieldsToken } from "@/features/board/fields/registry";
import { workspaceToken } from "@/features/board//workspace/registry";
import { addEntryRows } from "./logic/entry-actions";

interface WizardState {
        oldEntryValue?: string,
        debounceTimer?: NodeJS.Timeout,
        scrollLoader?: InfiniteScrollLoader<Entry>
}

const state: WizardState = {};

export const EntryWizard = {
        setDraft(partial: Partial<WizardState>) {
                Object.assign(state, partial);
        },

        getDebounceTimer() {
                return state.debounceTimer;
        },

        getOldEntryValue() {
                return state.oldEntryValue;
        },

        clearOldEntryValue() {
                state.oldEntryValue = undefined;
        },

        initScrollLoader() {
                state.scrollLoader = new InfiniteScrollLoader<Entry>({
                        fetcher: () => {
                                const boardId = MasterRegistry.get(workspaceToken).getBoardId();
                                if (!boardId) {
                                        throw new Error("Board Id not set");
                                }

                                return supabase.fetchPagedEntries({
                                        boardId,
                                        fieldCount: MasterRegistry.get(fieldsToken).getFieldCount(),
                                        sortedBy: MasterRegistry.get(fieldsToken).getSortedByInfo(),
                                        searchQuery: EntryState.getSearchQuery(),
                                });
                        },
                        onBatch: (entries) => addEntryRows(entries)
                });
        },

        resetScrollLoader(beforeBatch?: () => void) {
                state.scrollLoader?.reset(beforeBatch);
        },

        destroyScrollLoader() {
                state.scrollLoader?.destroy();
        },

        clearDebounceTimer() { clearTimeout(state.debounceTimer); },

        clear() {
                state.scrollLoader?.destroy();
                state.scrollLoader = undefined;
                state.debounceTimer = undefined;
                state.oldEntryValue = undefined;
        }
};
