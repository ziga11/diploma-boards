import { ActionFilter, ColumnFilter, type HistoryLog } from "../types";
import { appendHistoryLogs, setHistoryFilter } from "../ui/dom";
import { HistoryWizard } from "../wizard";

export function onFilterActionPress(elem: HTMLElement) {
        const action = elem.dataset.action;
        if (!action || action == HistoryWizard.getAction()) return;

        HistoryWizard.setAction(action as ActionFilter);

        setHistoryFilter(HistoryWizard.getAction(), HistoryWizard.getColumn());
}

export function onFilterColumnPress(elem: HTMLElement) {
        const column = elem.dataset.column;
        if (!column || column == HistoryWizard.getColumn()) return;

        HistoryWizard.setColumn(column as ColumnFilter);

        setHistoryFilter(HistoryWizard.getAction(), HistoryWizard.getColumn());
}

export function addHistoryLogs(logs: HistoryLog[]) {
        const filtered = logs.filter(log => {
                const activeAction = HistoryWizard.getAction();
                const activeColumn = HistoryWizard.getColumn();

                const actionMatch = activeAction === ActionFilter.All || log.action === activeAction;
                const columnMatch = activeColumn === ColumnFilter.All || log.target_column === activeColumn;
                return actionMatch && columnMatch;
        });

        appendHistoryLogs(filtered);
}
