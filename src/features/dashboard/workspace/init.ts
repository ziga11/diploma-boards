import { showToast } from "@/core/utils/dom";
import { fetchBoards } from "./logic";
import { fillBoards, setUserData } from "./view";
import { initWorkspaceEvents } from "./events";

export async function initWorkspace() {
        setUserData()
                .catch(err => { showToast(`Failed set user data ${err}`, "error") });

        initWorkspaceEvents();

        fetchBoards()
                .then(async boards => { await fillBoards(boards); })
                .catch(err => console.warn(`Failed to fetch boards ${err.message}`));
}
