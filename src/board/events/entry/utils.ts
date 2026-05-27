import { Globals } from "../../../globals";
import { type Entry } from "../../../types";
import { showToast } from "../../../utils";
import { boardElements } from "../../types";

export async function buttonTextBlur(fieldId: number, value: string) {
        const sameFieldSpans = document.querySelectorAll(`div[data-field-id="${fieldId}"] span`) as NodeListOf<HTMLSpanElement>;
        for (const fieldSpan of sameFieldSpans) {
                fieldSpan.innerText = value;
        }

        const field = Globals.fields.get(fieldId!);
        if (!field?.fieldHelpers) {
                const fieldHelper = await Globals.supabase.insertFieldHelper(fieldId, value);

                field!.fieldHelpers = [fieldHelper!];
        }
        else {
                const fieldHelper = field.fieldHelpers[0];
                fieldHelper.value = value;
                await Globals.supabase.updateFieldHelper(fieldHelper.value, { id: fieldHelper.id });
        }
}

export async function entryBlur(ev: Event, entry: Entry) {
        const target = ev.target as HTMLInputElement;
        entry.value = target.value;
        try {
                await Globals.supabase.updateEntries([entry]);
        }
        catch (e) {
                alert(e);
        }
}

export function dropdownOptionSelected(optionDiv: HTMLDivElement, optionText: string | null, entry: Entry, entryDiv: HTMLDivElement) {
        if (optionDiv.classList.contains("edit")) return;

        entry.value = optionText;
        entryDiv.innerText = optionText ?? "";
        Globals.supabase.updateEntries([entry]).catch((e) => {
                showToast(e, boardElements.toastContainer, "error");
        });

        boardElements.dropdownMenu.classList.remove("shown");
}
