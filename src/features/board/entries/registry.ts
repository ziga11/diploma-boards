import "./entries.css"
import { createToken, MasterRegistry } from "@/features/board/master-registry";
import { initEntryEvents } from "./event";
import { EntryState } from "./state";
import type { EntryModuleInterface } from "./types";
import { initEntriesView } from "./logic/entry-actions";

const publicInterface: EntryModuleInterface = {
        getRowCount: () => EntryState.getRowCount(),
};

export const entriesToken = createToken<EntryModuleInterface>("entries");

export const EntryModule = {
        async init(): Promise<void> {
                initEntriesView();

                if (!EntryState.isInitialized()) {
                        initEntryEvents();

                        MasterRegistry.register(entriesToken, publicInterface);
                        EntryState.setInitalized();
                }
        }
};
