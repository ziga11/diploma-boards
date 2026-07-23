import "./entries.css";
import { InfiniteScrollLoader } from "@/core/utils/dom";
import { initEntryEvents } from "./event";
import { fetchPagedEntries } from "./logic";
import { setEntryRows } from "./view";
import type { Entry } from "./types";
import { BoardState } from "../board-state";
import { supabase } from "@/core/api/supabase";
import { entryEvents } from "./custom-events";


export async function initEntries(fieldCount: number) {
        const generator = fetchPagedEntries(fieldCount);

        window.dispatchEvent(entryEvents.clearEntries());

        BoardState.setEntryFetchGenerator(generator)

        new InfiniteScrollLoader<Entry>({
                fetcher: () => generator,
                onBatch: (entries) => setEntryRows(entries)
        });

        const allEntryCount = await supabase.fetchEntryCount();

        const entryCount = [fieldCount, allEntryCount].includes(0) ? 0 : allEntryCount / fieldCount;

        BoardState.setRowCount({ all: entryCount });

        initEntryEvents();
}
