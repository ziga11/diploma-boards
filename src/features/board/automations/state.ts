import { AutomationType, type Automation } from "./types";

interface AutomationDomainState {
        isInitialized: boolean;
        automations: Map<string, Automation>;
}

const state: AutomationDomainState = { isInitialized: false, automations: new Map() };

export const AutomationsState = {
        isInitialized: () => state.isInitialized,

        setInitalized: () => state.isInitialized = true,

        setAutomations(automations: Automation[]) {
                state.automations = new Map(automations.map(a => [a.id!, a]));
        },

        addAutomation(a: Automation) {
                if (a.id) state.automations.set(a.id, a);
        },

        removeAutomation(id: string) {
                state.automations.delete(id);
        },

        getByFieldId(fieldId: string): Automation[] {
                return Array.from(state.automations.values()).filter(a => a.fieldId === fieldId);
        },

        getAutomations({ typeId, fieldId }: { typeId: AutomationType, fieldId: string }): Automation[] {
                return Array.from(state.automations.values()).filter(a => {
                        return typeId ? a.type === typeId : true
                                && fieldId ? a.fieldId === fieldId : true;
                });
        },

        getAutomaton(id: string): Automation | null {
                return state.automations.get(id) ?? null;
        },

        anyExistingAutomations() {
                return state.automations.size > 0;
        },

        clear() {
                state.automations.clear();
        }
};
