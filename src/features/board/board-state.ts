import type { Automation } from "./automations/types";
import type { Entry } from "./entries/types";
import type { Field } from "./fields/types";
import type { Collaborator, InvitedCollaborator } from "./user-management/types";
import type { Board } from "./workspace/types";

interface BoardState {
        searchQuery: string,
        entryRowCount: { rendered: number, all: number },
        isInitialized: boolean;
        activeBoard: Board | null;
        sortedBy: { fieldId?: string, ascending?: boolean },
        fieldIdAutomationMap: Map<string, Array<Automation>>,
        accIdCollaboratorMap: Map<string, Collaborator>,
        invitedCollaborators: Array<InvitedCollaborator>,
        fieldsMap: Map<string, Field>;
        selectedFieldId: number | null;
        fetchEntryGenerator: undefined | AsyncGenerator<Array<Entry>>;
}

const state: BoardState = {
        searchQuery: "",
        entryRowCount: { rendered: 0, all: 0 },
        isInitialized: false,
        activeBoard: null,
        fieldIdAutomationMap: new Map(),
        accIdCollaboratorMap: new Map(),
        invitedCollaborators: [],
        fieldsMap: new Map(),
        selectedFieldId: null,
        sortedBy: { fieldId: undefined, ascending: undefined },
        fetchEntryGenerator: undefined
};

export const BoardState = {
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
                return state.entryRowCount;
        },
        get automations() {
                return state.fieldIdAutomationMap;
        },
        get isDeleted() {
                return state.activeBoard?.deleted;
        },
        get collaborators() {
                return state.accIdCollaboratorMap;
        },
        get invitedCollaborators() {
                return state.invitedCollaborators;
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
                        state.entryRowCount.rendered = rendered;
                }

                if (all) {
                        state.entryRowCount.all = all;
                }
        },

        incrementRowCount() {
                const rendered = state.entryRowCount.rendered;
                const all = state.entryRowCount.all;

                state.entryRowCount = { rendered: rendered + 1, all: all + 1 };
        },

        decrementRowCount() {
                const rendered = state.entryRowCount.rendered;
                const all = state.entryRowCount.all;

                state.entryRowCount = { rendered: rendered - 1, all: all - 1 };
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

        setCollaborators(collaborators: Array<Collaborator>) {
                state.accIdCollaboratorMap = new Map(collaborators.map(c => [c.account_id!, c]));
        },

        addCollaborator(c: Collaborator) {
                state.accIdCollaboratorMap.set(c.account_id, c);
        },

        removeCollaborator(accId: string) {
                state.accIdCollaboratorMap.delete(accId);
        },

        updateCollaboratorPermission(accId: string, permissionId: number) {
                const c = state.accIdCollaboratorMap.get(accId);
                if (!c) return;
                c.permission_id = permissionId;
        },

        setInvitedCollaborators(invCollaborators: Array<InvitedCollaborator>) {
                state.invitedCollaborators = invCollaborators;
        },

        addInvitedCollaborator(c: InvitedCollaborator) {
                state.invitedCollaborators.push(c);
        },

        removeInvitedCollaborator(email: string) {
                const index = state.invitedCollaborators.findIndex(e => e.to_email = email);
                state.invitedCollaborators.splice(index, 1);
        },

        getField(id: string) {
                return state.fieldsMap.get(id);
        },

        setField(field: Field) {
                if (!field.id) return;
                return state.fieldsMap.set(field.id, field);
        },

        clear() {
                state.fieldsMap.clear();
                state.fieldIdAutomationMap.clear();
                state.accIdCollaboratorMap.clear();
                state.activeBoard = null;
                state.fetchEntryGenerator = undefined;
                state.searchQuery = "";
                state.entryRowCount = { all: 0, rendered: 0 };
                state.sortedBy = { fieldId: undefined, ascending: undefined }
        }
}
