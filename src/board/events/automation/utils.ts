import { Globals } from "../../../globals";
import type { Automation } from "../../../types";
import { setStateClass } from "../../../utils";
import { automationElements } from "../../types";

export async function deleteAutomation(div: HTMLElement, automation: Automation) {
        automation.board_id = Globals.board!.id;
        await Globals.supabase.deleteFieldAutomation(automation);

        const parentDiv = div.parentElement;

        div.remove();
        if (parentDiv?.children.length == 0) {
                const elems = automationElements;
                setStateClass([elems.modify.noAutomations], [elems.create.noFields, elems.create.type.div, elems.create.field.div, elems.create.url.div, elems.modify.existingAutomations], "shown")
        }
}

export function automationOptionClick(ev: MouseEvent) {
        const automationOptionDiv = ev.target as HTMLDivElement;

        setStateClass(
                [automationElements.create.url.div],
                [automationElements.create.type.div, automationElements.create.field.div, automationElements.modify.existingAutomations],
                "shown");

        Globals.selectedFieldId = Number(automationOptionDiv.dataset.fieldId);
}
