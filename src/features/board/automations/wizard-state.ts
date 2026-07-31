import { fieldsToken } from "../fields/registry";
import { MasterRegistry } from "../master-registry";
import { HTML } from "./html";
import { automationTypeToString } from "./logic";
import { AutomationType } from "./types";
import { checkMenuTabBtn, clearFieldHeaderOptions, clearUrlHeaderOptions, setFieldHeaderOptions, setUrlHeaderOptions } from "./ui/dom";

interface WizardState {
        automationId?: AutomationType;
        fieldId?: string;
        url?: string;
        history: HTMLDivElement[];
}

const state: WizardState = {
        history: []
};

export const AutomationsWizard = {
        get currentView(): HTMLDivElement | undefined {
                return state.history.at(-1);
        },

        get draft() {
                return {
                        automationId: state.automationId,
                        fieldId: state.fieldId,
                        url: state.url,
                };
        },

        setDraft(partial: Partial<Omit<WizardState, "history">>) {
                Object.assign(state, partial);
        },

        pushView(div: HTMLDivElement) {
                const current = this.currentView;
                if (current == div) return;

                if (current) current.classList.remove("shown");

                state.history.push(div);

                this.setHeaderOptions(div);

                const modifyChecked = [HTML.modify.existingAutomations, HTML.modify.noAutomations.div].includes(div);
                checkMenuTabBtn(modifyChecked);

                div.classList.add("shown");
        },

        popView() {
                if (state.history.length <= 1) return;

                const removed = state.history.pop();
                if (removed) removed.classList.remove("shown");

                this.clearState(removed!);

                const previous = this.currentView;
                if (!previous) return;

                this.setHeaderOptions(previous);

                previous.classList.add("shown");

                const modifyAutomations = [HTML.modify.existingAutomations, HTML.modify.noAutomations.div]
                const modifyChecked = modifyAutomations.includes(this.currentView);
                checkMenuTabBtn(modifyChecked);
        },

        setHeaderOptions(div: HTMLDivElement) {
                if (div === HTML.create.field.div) {
                        clearFieldHeaderOptions();
                        const automationType = automationTypeToString(AutomationsWizard.draft.automationId!);

                        setFieldHeaderOptions(automationType);
                }
                else if (div === HTML.create.url.div) {
                        clearUrlHeaderOptions();
                        const automationType = automationTypeToString(AutomationsWizard.draft.automationId!);
                        if (AutomationsWizard.draft.fieldId) {
                                const field = MasterRegistry.get(fieldsToken).getFieldById(AutomationsWizard.draft.fieldId!);

                                setUrlHeaderOptions(automationType, field?.id!, field?.name!);
                        }
                        else {
                                setUrlHeaderOptions(automationType);
                        }

                }
        },

        clearState(div: HTMLDivElement) {
                if (div === HTML.create.field.div) {
                        state.automationId = undefined;
                }
                else if (div === HTML.create.url.div) {
                        state.fieldId = undefined;
                }
        },

        reset() {
                state.history.forEach(div => (div.classList.remove("shown")));
                state.history = [];
                state.automationId = undefined;
                state.fieldId = undefined;
                state.url = undefined;
        }
};
