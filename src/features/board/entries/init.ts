import "./entries.css";
import { InfiniteScrollLoader } from "@/core/utils/dom";
import { initEntryEvents } from "./event";
import { fetchPagedEntries } from "./logic";
import { setEntryRows } from "./view";
import type { Entry } from "./types";
import { BoardStore } from "../board-state";
import { supabase } from "@/core/api/supabase";


export async function initEntries(fieldCount: number) {
        const generator = fetchPagedEntries(fieldCount);

        BoardStore.setEntryFetchGenerator(generator)

        new InfiniteScrollLoader<Entry>({
                fetcher: () => generator,
                onBatch: (entries) => setEntryRows(entries)
        });

        const allEntryCount = await supabase.fetchEntryCount();

        const entryCount = [fieldCount, allEntryCount].includes(0) ? 0 : allEntryCount / fieldCount;

        BoardStore.setRowCount({ all: entryCount });

        initEntryEvents();
}
