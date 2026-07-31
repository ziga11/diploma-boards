import { MasterRegistry } from "@/features/board/master-registry";
import { fieldsToken } from "@/features/board/fields/registry";
import { HTML } from "../html";
import { setEntryValue } from "../ui";

export function setValueToEntries(elems: HTMLElement[] | NodeListOf<HTMLElement>, value?: string, optionId?: string) {
        let val: string | undefined = value;

        if (optionId && elems.length > 0) {
                const fieldId = elems[0].dataset.fieldId!;
                const field = MasterRegistry.get(fieldsToken).getFieldById(fieldId)!;
                val = field.options?.[optionId]?.value;
        }

        if (!val) return;

        elems.forEach(e => setEntryValue(e, val!));
}

export function removeFieldEntries(fieldId: string) {
        const fieldCount = MasterRegistry.get(fieldsToken).getFieldCount();

        if (fieldCount === 1) {
                const entrySets = HTML.entriesContainer.querySelectorAll(".entry-set") as NodeListOf<HTMLDivElement>;
                entrySets.forEach(es => es.remove());
        } else {
                const entries = HTML.entriesContainer.querySelectorAll(`[data-field-id="${fieldId}"]`) as NodeListOf<HTMLDivElement>;
                entries.forEach(e => e.remove());
        }
}

export function setfieldEntriesIndex(fieldId: string, index: number) {
        const entries = HTML.entriesContainer.querySelectorAll(`.entry[data-field-id="${fieldId}"]`) as NodeListOf<HTMLElement>;
        entries.forEach(e => {
                e.dataset.order = `${index}`;
                e.style.order = `${index}`;
        });
}
