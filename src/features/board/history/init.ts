import { BoardStore } from "../board-state";
import { initHistoryEvents } from "./event";
import { fetchCollaborators } from "./logic";

export async function initHistory() {
        fetchCollaborators()
                .then(collaborators => {
                        BoardStore.setCollaborators(collaborators);
                        initHistoryEvents();
                })
                .catch((e) => console.log(e));

}
