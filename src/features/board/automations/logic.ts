import { AutomationType, type Automation, type AutomationDB, type AutomationInsert } from "./types";
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

function prepareAndRenderFields(type: AutomationType): void {
        const aId = type ?? AutomationsWizard.draft.type;
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

export function selectAutomationType(type: AutomationType): void {
        AutomationsWizard.setDraft({ type: type });

        const needsFieldSelection = [AutomationType.EntryChange, AutomationType.ButtonPress].includes(type);

        if (needsFieldSelection) {
                prepareAndRenderFields(type);
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
        if (!inputUrl) {
                showToast("Failed to insert an automation: url not set", "error");
                return;
        }

        const draft = AutomationsWizard.draft;
        if (!draft.type) {
                showToast("Failed to insert an automation: type not set", "error");
                return;
        }

        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) {
                showToast("Failed to get the boardId", "error");
                return;
        }

        const acc = await supabase.getAccount();
        if (!acc || !acc.id) {
                showToast("Failed to get the account", "error");
                return;
        }

        AutomationsWizard.setDraft({ url: inputUrl });

        const newAutomation = {
                id: crypto.randomUUID(),
                boardId: boardId,
                type: draft.type,
                fieldId: draft.fieldId ?? null,
                urlCall: inputUrl,
                accountId: acc.id,
                dateCreated: Date(),
        } as Automation;

        const automationHTML = addAutomationView(newAutomation);

        try {
                const savedAutomation = await insertAutomation(newAutomation);
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
        const insertAutomation = AutomationToInsert(automation);

        const dbAutomation = await supabase.insertFieldAutomation(insertAutomation);

        return DBToAutomation(dbAutomation);
}

export async function deleteAutomation(id: string) {
        const dbAutomation = await supabase.deleteFieldAutomation(id);
        return DBToAutomation(dbAutomation);
}

export async function fetchAutomations(): Promise<Automation[]> {
        const boardId = MasterRegistry.get(workspaceToken).getBoardId();
        if (!boardId) throw new Error("Failed to get the boardId");


        const dbAutomations = await supabase.fetchFieldAutomations(boardId);

        return dbAutomations.map(DBToAutomation);
}

export function AutomationToInsert(a: Automation): AutomationInsert {
        return {
                id: a.id!,
                account_id: a.accountId,
                board_id: a.boardId,
                field_id: a.fieldId,
                type: a.type,
                url_call: a.urlCall,
        };
}

export function DBToAutomation(a: AutomationDB): Automation {
        return {
                id: a.id,
                type: a.type,
                urlCall: a.url_call,
                fieldId: a.field_id,
                boardId: a.board_id,
                accountId: a.account_id,
                dateCreated: a.date_created
        } as Automation;
}
