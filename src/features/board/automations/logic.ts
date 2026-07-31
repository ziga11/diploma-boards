import { AutomationType, type Automation } from "./types";
import { supabase } from "@/core/api/supabase";
import { AutomationsWizard } from "./wizard-state";
import { HTML } from "./html";
import { showToast } from "@/core/utils/dom";
import { AutomationsState } from "./state";
import { MasterRegistry } from "@/features/board/master-registry";
import { fieldsToken } from "@/features/board/fields/registry";
import { workspaceToken } from "@/features/board/workspace/registry";
import { addAutomationView, clearUrlInput, hideAutomationByIdView, removeAutomationUi, renderFieldOptions, showAutomation, showCreatedAutomations } from "./ui/dom";
import { getVisibleAutomationsCount } from "./ui/utils";

function prepareAndRenderFields(id: AutomationType): void {
        const aId = id ?? AutomationsWizard.draft.automationId;
        if (!aId) return;

        const allFields = MasterRegistry.get(fieldsToken).getAllFields();

        const filteredFields = allFields.filter(field => {
                if (aId === AutomationType.ButtonPress) {
                        return field.type === "button";
                }
                return true;
        });

        renderFieldOptions(filteredFields);
}

export function automationTypeToString(type: AutomationType) {
        return AutomationType[type]
                .replace(/(?<=[a-z])(?=[A-Z])/g, ' ');
}

export function hideAutomationById(id: string): HTMLDivElement | null {
        const automationEntry = hideAutomationByIdView(id);

        if (getVisibleAutomationsCount() === 0) {
                AutomationsWizard.pushView(HTML.modify.noAutomations.div);
        }

        return automationEntry;
}

export function selectAutomationType(typeId: AutomationType): void {
        AutomationsWizard.setDraft({ automationId: typeId });

        const needsFieldSelection = [AutomationType.EntryChange, AutomationType.ButtonPress].includes(typeId);

        if (needsFieldSelection) {
                prepareAndRenderFields(typeId);
                AutomationsWizard.pushView(HTML.create.field.div);
        } else {
                AutomationsWizard.pushView(HTML.create.url.div);
        }
}

export function selectAutomationField(fieldId: string): void {
        AutomationsWizard.setDraft({ fieldId });
        AutomationsWizard.pushView(HTML.create.url.div);
}

export function removeAutomation(removeBtn: HTMLElement) {
        const parent = removeBtn.closest(".created-board-automation") as HTMLDivElement;

        const div = hideAutomationByIdView(parent.dataset.id);
        if (!div) return;

        deleteAutomation(parent.dataset.id!)
                .then(a => {
                        AutomationsState.removeAutomation(a.id!);
                        removeAutomationUi(div);
                })
                .catch(err => {
                        showToast(`Failed to remove automation ${err}`, "error");
                        showAutomation(div);
                });
}

export function setAutomationURL(url: string) {
        AutomationsWizard.setDraft({ url });
}

export async function finishAutomationCreation(inputUrl: string): Promise<void> {
        const draft = AutomationsWizard.draft;
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        const acc = await supabase.getAccount();

        if (!acc) {
                showToast("Failed to get the account", "error");
                return;
        }
        if (!boardId) {
                showToast("Failed to get the boardId", "error");
                return;
        }
        if (!draft.automationId) {
                showToast("Failed to insert an automation: automationId not set", "error");
                return;
        }
        if (!inputUrl) {
                showToast("Failed to insert an automation: url not set", "error");
                return;
        }

        AutomationsWizard.setDraft({ url: inputUrl });

        const newAutomation: Automation = {
                board_id: boardId,
                automation_id: draft.automationId,
                field_id: draft.fieldId,
                url_call: inputUrl,
                account_id: acc.id
        };

        const automationHTML = addAutomationView(newAutomation);

        try {
                const savedAutomation = await insertAutomation(newAutomation);

                automationHTML.dataset.id = `${savedAutomation.id}`;

                AutomationsState.addAutomation(savedAutomation);

                clearUrlInput();
                AutomationsWizard.reset();

                showCreatedAutomations();
        } catch (err) {
                showToast(`Failed to insert the automation: ${err}`, "error");
                removeAutomationUi(automationHTML);
        }
}

export async function insertAutomation(automation: Automation): Promise<Automation> {
        return supabase.insertFieldAutomation(automation);
}

export async function deleteAutomation(id: string) {
        return await supabase.deleteFieldAutomation(id);
}

export async function fetchAutomations(): Promise<Array<Automation>> {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("Failed to get the boardId");

        return await supabase.fetchFieldAutomations(boardId);
}
