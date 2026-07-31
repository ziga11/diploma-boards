import { InfiniteScrollLoader } from "@/core/utils/dom";
import { ActionFilter, ColumnFilter, type EntryLog, type HistoryLog } from "./types";
import { MasterRegistry } from "@/features/board/master-registry";
import { workspaceToken } from "@/features/board/workspace/registry";
import { clearHistoryList, clearPayloadList } from "./ui/utils";
import { supabase } from "@/core/api/supabase";
import { appendHistoryLogs, appendPayloadLogs } from "./ui/dom";
import { HTML } from "./html";

interface WizardState {
        action: ActionFilter;
        column: string;

        logId?: string;

        payloadLoader?: InfiniteScrollLoader<EntryLog>
        historyLoader?: InfiniteScrollLoader<HistoryLog>
}

const state: WizardState = {
        action: ActionFilter.All,
        column: ColumnFilter.All
};

export const HistoryWizard = {
        setAction(action: ActionFilter) {
                state.action = action;
        },

        getAction() {
                return state.action;
        },

        setColumn(column: ColumnFilter) {
                state.column = column;
        },

        getColumn() {
                return state.column;
        },

        openPayloadModal(logId: string): void {
                const boardId = MasterRegistry.get(workspaceToken).getBoardId();
                if (!boardId) throw new Error("Failed to fetch entries, board id not set");

                state.logId = logId;
                clearPayloadList();

                if (!state.payloadLoader) {
                        state.payloadLoader = new InfiniteScrollLoader<EntryLog>({
                                fetcher: () => {
                                        if (!state.logId) throw new Error("Log ID not set");
                                        return supabase.fetchHistoryLogEntries(boardId, state.logId);
                                },
                                onBatch: (logs) => appendPayloadLogs(logs),
                        });
                } else {
                        state.payloadLoader.reset();
                }

                HTML.payloadModal.showModal();
        },

        openHistoryModal(): void {
                const boardId = MasterRegistry.get(workspaceToken).getBoardId();
                if (!boardId) throw new Error("Failed to fetch entries, board id not set");

                clearHistoryList();

                if (!state.historyLoader) {
                        state.historyLoader = new InfiniteScrollLoader<HistoryLog>({
                                fetcher: () => supabase.fetchHistory(boardId),
                                onBatch: (logs) => appendHistoryLogs(logs),
                        });
                } else {
                        state.historyLoader.reset();
                }

                HTML.modal.showModal();
        },
};
