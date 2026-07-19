import type { Automation } from "./automations/types";
import type { Entry } from "./entries/types";
import type { Field } from "./fields/types";
import type { BoardCollaborator } from "./user-management/types";
import type { Board } from "./workspace/types";

interface BoardState {
        searchQuery: string,
        entryCount: { rendered: number, all: number },
        isInitialized: boolean;
        activeBoard: Board | null;
        sortedBy: { fieldId?: string, ascending?: boolean },
        fieldIdAutomationMap: Map<string, Array<Automation>>,
        accIdCollaboratorMap: Map<string, BoardCollaborator>,
        fieldsMap: Map<string, Field>;
        selectedFieldId: number | null;
        fetchEntryGenerator: undefined | AsyncGenerator<Array<Entry>>;
}

const state: BoardState = {
        searchQuery: "",
        entryCount: { rendered: 0, all: 0 },
        isInitialized: false,
        activeBoard: null,
        fieldIdAutomationMap: new Map(),
        accIdCollaboratorMap: new Map(),
        fieldsMap: new Map(),
        selectedFieldId: null,
        sortedBy: { fieldId: undefined, ascending: undefined },
        fetchEntryGenerator: undefined
};

export const BoardStore = {
        get isInitialized() {
                return state.isInitialized;
        },
        get activeBoard() {
                return state.activeBoard;
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
        get isDeleted() {
                return state.activeBoard?.deleted;
        },
        get selectedFieldId() {
                return state.selectedFieldId;
        },
        get collaborators() {
                return state.accIdCollaboratorMap;
        },
        get sortedBy() {
                return state.sortedBy;
        },
        get searchQuery() {
                return state.searchQuery;
        },
        get entryFetchGenerator() {
                return state.fetchEntryGenerator;
        },

        setPermissionId(permissionId: number) {
                if (!state.activeBoard) return;
                state.activeBoard.permission_id = permissionId;
        },
        setEntryFetchGenerator(generator: AsyncGenerator<Array<Entry>>) {
                state.fetchEntryGenerator = generator;
        },

        setSortedBy(fieldId?: string, ascending?: boolean) {
                state.sortedBy.fieldId = fieldId;
                state.sortedBy.ascending = ascending;
        },

        setSearchQuery(query: string) {
                state.searchQuery = query;
        },

        setRowCount({ rendered, all }: { rendered?: number, all?: number }) {
                if (rendered) {
                        state.entryCount.rendered = rendered;
                }

                if (all) {
                        state.entryCount.all = all;
                }
        },

        incrementRowCount() {
                const rendered = state.entryCount.rendered;
                const all = state.entryCount.all;

                state.entryCount = { rendered: rendered + 1, all: all + 1 };
        },

        decrementRowCount() {
                const rendered = state.entryCount.rendered;
                const all = state.entryCount.all;

                state.entryCount = { rendered: rendered - 1, all: all - 1 };
        },

        setInitialized() {
                state.isInitialized = true;
        },

        setBoardTitle(newTitle: string) {
                if (!state.activeBoard) return;
                state.activeBoard.name = newTitle;
        },

        setBoardColor(newColor: string) {
                if (!state.activeBoard) return;
                state.activeBoard.color = newColor;
        },

        setActiveBoard(board: Board) {
                state.activeBoard = board;
        },

        recoverBoard() {
                if (!state.activeBoard) return;
                state.activeBoard.deleted = false;
        },

        setAutomations(automations: Array<Automation>) {
                for (const a of automations) {
                        if (!state.fieldIdAutomationMap.has(a.field_id!)) {
                                state.fieldIdAutomationMap.set(a.field_id!, []);
                        }

                        const key = a.field_id ?? `${a.automation_id}`;
                        state.fieldIdAutomationMap.get(key)!.push(a);
                }
        },

        setFields(fields: Array<Field>) {
                state.fieldsMap = new Map(fields.map(f => [f.id!, f]));
        },

        setCollaborators(collaborators: Array<BoardCollaborator>) {
                state.accIdCollaboratorMap = new Map(collaborators.map(c => [c.account_id!, c]));
        },

        addCollaborator(c: BoardCollaborator) {
                state.accIdCollaboratorMap.set(c.account_id, c);
        },

        updateCollaboratorPermission(accId: string, permissionId: number) {
                const c = state.accIdCollaboratorMap.get(accId);
                if (!c) return;
                c.permission_id = permissionId;
        },

        removeCollaborator(accId: string) {
                state.accIdCollaboratorMap.delete(accId);
        },

        getField(id: string) {
                return state.fieldsMap.get(id);
        }
}
