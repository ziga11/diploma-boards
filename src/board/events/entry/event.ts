import { Globals } from "../../../globals";
import type { Entry } from "../../../types";
import { boardElements, topToolbar } from "../../types";
import { createEntryRow } from "../../utils/entry";


topToolbar.left.newEntryBtn.addEventListener("click", async () => {
        if (boardElements.fields.length == 0) return;
        const entries = [] as Entry[];
        const fieldDivs = document.querySelectorAll(".field-div") as NodeListOf<HTMLDivElement>;

        const rowCount = boardElements.entryChecks.length;
        for (const fieldDiv of fieldDivs) {
                const newEntry = {
                        field_id: Number(fieldDiv.dataset.fieldId),
                        board_id: Globals.board?.id,
                        type: fieldDiv.dataset.type,
                        account_id: Globals.account?.id,
                        value: null,
                        index: rowCount + 1,
                } as Entry;

                entries.push(newEntry);
        }

        const insertedEntries = await Globals.supabase.insertEntries(entries);
        await createEntryRow(insertedEntries);
});


