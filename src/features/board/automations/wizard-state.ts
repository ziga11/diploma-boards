import { HTML } from "./html";
import { AutomationType } from "./types";

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

        getModifyAutomations() {
                return [HTML.modify.existingAutomations, HTML.modify.noAutomations.div];
        },

        setDraft(partial: Partial<Omit<WizardState, "history">>) {
                Object.assign(state, partial);
        },

        pushView(div: HTMLDivElement) {
                const current = this.currentView;
                if (current == div) return;

                if (current) current.classList.remove("shown");

                state.history.push(div);

                this.checkMenuTabBtn();
                div.classList.add("shown");
        },

        checkMenuTabBtn() {
                if (!this.currentView) return;
                const modifyChecked = this.getModifyAutomations().includes(this.currentView);

                HTML.modify.btn.checked = modifyChecked;
                HTML.create.btn.checked = !modifyChecked;
        },

        popView() {
                if (state.history.length <= 1) return;

                const removed = state.history.pop();
                if (removed) removed.classList.remove("shown");

                const previous = this.currentView;
                if (!previous) return;

                previous.classList.add("shown");
                this.checkMenuTabBtn();
        },

        reset() {
                state.history.forEach(div => (div.classList.remove("shown")));
                state.history = [];
                state.automationId = undefined;
                state.fieldId = undefined;
                state.url = undefined;
        }
};
