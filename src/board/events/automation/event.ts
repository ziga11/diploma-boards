import { Globals } from "../../../globals";
import { AutomationId, type Automation } from "../../../types";
import { setStateClass } from "../../../utils";
import { automationElements, boardElements, topToolbar } from "../../types";
import { createAutomation, createAutomationSelectionOption } from "../../utils/automation";

const create = automationElements.create;
const modify = automationElements.modify;

const url = create.url;
const field = create.field;
const type = create.type;

url.back.addEventListener("click", () => {
        const showTypes = [AutomationId.ItemCreated, AutomationId.ItemDeleted, AutomationId.AnyFieldChange].includes(Globals.automationOption!);

        if (showTypes) {
                setStateClass([type.div], [modify.noAutomations, create.noFields, field.div, url.div, modify.existingAutomations], "shown")
        }
        else {
                setStateClass([field.div], [modify.noAutomations, create.noFields, type.div, url.div, modify.existingAutomations], "shown")
        }
});

automationElements.modal.addEventListener("hide.bs.modal", () => {
        create.btn.checked = true;
        setStateClass([], [modify.noAutomations, create.noFields, type.div, field.div, url.div, modify.existingAutomations], "shown")
});

[topToolbar.right.automationsBtn, create.btn, modify.createAutomationCta, field.back].forEach((btn) => {
        btn.addEventListener("click", () => {
                create.btn.checked = true;
                if (boardElements.fields.length == 0) {
                        setStateClass([create.noFields], [modify.noAutomations, type.div, field.div, url.div, modify.existingAutomations], "shown")
                } else {
                        setStateClass([type.div], [modify.noAutomations, create.noFields, field.div, url.div, modify.existingAutomations], "shown")
                }
        });
});

modify.btn.addEventListener("click", () => {
        create.btn.checked = false;
        if ([boardElements.fields.length, modify.existingAutomations.children.length].includes(0)) {
                setStateClass([modify.noAutomations], [create.noFields, type.div, field.div, url.div, modify.existingAutomations], "shown")
        } else {
                setStateClass([modify.existingAutomations], [modify.noAutomations, create.noFields, field.div, url.div, type.div], "shown")
        }
});

for (const option of type.options) {
        option.addEventListener("click", () => {
                Globals.automationOption = Number(option.dataset.automationType) as AutomationId;
                const showUrl = [AutomationId.ItemCreated, AutomationId.ItemDeleted, AutomationId.AnyFieldChange].includes(Globals.automationOption);
                if (showUrl) {
                        setStateClass([url.div], [modify.noAutomations, create.noFields, modify.existingAutomations, field.div, type.div], "shown")
                        return;
                }

                const linker: Partial<Record<AutomationId, string[]>> = {
                        [AutomationId.TextChange]: ["text"],
                        [AutomationId.StatusChange]: ["status"],
                        [AutomationId.ButtonPress]: ["button"],
                };

                let selectionOptions = [];
                const applicableFieldTypes = linker[Globals.automationOption];

                for (const field of Array.from(Globals.fields.values())) {
                        if (applicableFieldTypes!.includes(field.type!)) {
                                selectionOptions.push(createAutomationSelectionOption(field));
                        }
                }
                field.fieldsContainer.replaceChildren(...selectionOptions);
                setStateClass([field.div], [modify.noAutomations, create.noFields, modify.existingAutomations, url.div, type.div], "shown")
        });
}

url.finish.addEventListener("click", () => {
        const automation = {
                field_id: Globals.selectedFieldId,
                automation_id: Globals.automationOption,
                url_call: url.input.value,
                board_id: Globals.board?.id,
                account_id: Globals.account?.id
        } as Automation;

        const div = createAutomation(automation);
        modify.existingAutomations.appendChild(div);

        url.input.innerText = "";

        Globals.supabase.createFieldAutomation(automation);
        modify.btn.checked = true;
        setStateClass([modify.existingAutomations], [url.div], "shown")
});

automationElements.closeModalBtn.addEventListener("click", () => setStateClass([], [automationElements.modal], "shown"));
