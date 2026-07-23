import "./fields.css";
import { BoardState } from "../board-state";
import { initFieldEvents } from "./event";
import { fetchFields } from "./logic";
import { appendFieldDivs, applyPermissionRestrictions, initFieldWidthStyles } from "./view";
import { fieldEvents } from "./custom-events";

export async function initFields(): Promise<number> {
        try {
                window.dispatchEvent(fieldEvents.clearFields());

                const fields = await fetchFields();

                appendFieldDivs(fields);

                BoardState.setFields(fields);

                applyPermissionRestrictions();
                initFieldWidthStyles();

                initFieldEvents();

                return fields.length;
        }
        catch (err) {
                throw new Error(`Failed to init fields ${err}`);
        }
}
