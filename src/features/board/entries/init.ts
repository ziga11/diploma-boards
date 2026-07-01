import { BoardStore } from "../board-state";
import { initEntryEvents } from "./event";
import { HTML } from "./html";
import { fetchEntries } from "./logic";
import { createEntryRow } from "./view";


export async function initEntries(fieldCount: number) {
        return fetchEntries()
                .then(entries => {
                        const rows = [] as Array<HTMLDivElement>;

                        for (let i = 0; i < entries.length; i += fieldCount) {
                                const row = createEntryRow(entries.slice(i, i + fieldCount));
                                rows.push(row);
                        }

                        HTML.entryDiv.append(...rows);

                        initEntryEvents();
                        BoardStore.setRowCount(entries.length / fieldCount);
                })
                .catch(err => { throw new Error(`Failed to create entries ${err}`); })
}
