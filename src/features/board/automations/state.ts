import type { AutomationId } from "./types";

interface AutomationState {
        activeDiv?: HTMLDivElement,

        automationId?: AutomationId,
        fieldId?: string,
        url?: string,
}

export let automationState: AutomationState = {};

export function clearState() { automationState = {}; }
