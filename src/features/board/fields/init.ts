import { BoardStore } from "../board-state";
import { initFieldEvents } from "./event";
import { fetchFields, setFieldHelpers } from "./logic";
import { appendFieldDivs, applyPermissionRestrictions } from "./view";

export async function initFields(): Promise<number> {
        try {
                const fields = await fetchFields();

                setFieldHelpers(fields);
                appendFieldDivs(fields);

                BoardStore.setFields(fields);

                applyPermissionRestrictions();

                initFieldEvents();

                return fields.length;
        }
        catch (err) {
                throw new Error(`Failed to init fields ${err}`);
        }
}
