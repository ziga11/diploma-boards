import { BoardStore } from "../board-state";
import { initHistoryEvents } from "./event";
import { fetchCollaborators } from "./logic";

export function initHistory() {
        fetchCollaborators()
                .then(collaborators => BoardStore.setCollaborators(collaborators));

        initHistoryEvents();
}
