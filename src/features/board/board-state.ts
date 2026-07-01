import type { Automation } from "./automations/types";
import type { Field } from "./fields/types";
import type { BoardCollaborator } from "./user-management/types";
import type { Board } from "./workspace/types";

interface BoardState {
        entryCount: number,
        isInitialized: boolean;
        activeBoard: Board | null;
        fieldIdAutomationMap: Map<string, Array<Automation>>,
        accIdCollaboratorMap: Map<string, BoardCollaborator>,
        fieldsMap: Map<string, Field>;
        selectedFieldId: number | null;
}

const state: BoardState = {
        entryCount: 0,
        isInitialized: false,
        activeBoard: null,
        fieldIdAutomationMap: new Map(),
        accIdCollaboratorMap: new Map(),
        fieldsMap: new Map(),
        selectedFieldId: null,
};

export const BoardStore = {
        get isInitialized() {
                return state.isInitialized;
        },
        get boardId() {
                return state.activeBoard?.id ?? null;
        },
        get boardTitle() {
                return state.activeBoard?.name;
        },
        get permissionId() {
                return state.activeBoard?.permission_id ?? null;
        },
        get fields() {
                return state.fieldsMap;
        },
        get rowCount() {
                return state.entryCount;
        },
        get automations() {
                return state.fieldIdAutomationMap;
        },
        get selectedFieldId() {
                return state.selectedFieldId;
        },
        get collaborators() {
                return state.accIdCollaboratorMap;
        },

        setRowCount(entryCount: number) {
                state.entryCount = entryCount;
        },

        incrementRowCount() {
                state.entryCount += 1;
        },

        setInitialized() {
                state.isInitialized = true;
        },

        setBoardTitle(newTitle: string) {
                if (!state.activeBoard) return;
                state.activeBoard.name = newTitle;
        },

        setBoard(board: Board) {
                state.activeBoard = board;
        },

        setAutomations(automations: Array<Automation>) {
                for (const automation of automations) {
                        if (!state.fieldIdAutomationMap.has(automation.field_id!)) {
                                state.fieldIdAutomationMap.set(automation.field_id!, []);
                        }
                        state.fieldIdAutomationMap.get(automation.field_id!)!.push(automation);
                }
        },

        setFields(fields: Array<Field>) {
                state.fieldsMap = new Map(fields.map(f => [f.id!, f]));
        },

        setCollaborators(collaborators: Array<BoardCollaborator>) {
                state.accIdCollaboratorMap = new Map(collaborators.map(c => [c.account_id!, c]));
        },

        getField(fieldId: string) {
                return state.fieldsMap.get(fieldId);
        }
}
