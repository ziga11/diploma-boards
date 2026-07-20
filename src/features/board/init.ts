import { supabase } from "@/core/api/supabase";
import { navigate } from "@/core/utils/router";
import { BoardStore } from "./board-state";
import { initFields } from "./fields/init";
import { initEntries } from "./entries/init";
import { initWorkspace } from "./workspace/init";
import { initTopToolbar } from "./top-toolbar/init";
import { initAutomations } from "./automations/init";
import { initBottomToolbar } from "./bottom-toolbar/init";
import { initUserManagement } from "./user-management/init";
import { initHistory } from "./history/init";

export async function init(props: Record<string, any>) {
        const acc = await supabase.getAccount()
        if (!acc) {
                navigate("/login");
                return;
        }

        const boardId = props["board_id"];


        try {
                const board = await supabase.fetchBoard(boardId);
                BoardStore.setActiveBoard(board);
                const sortDescending = localStorage.getItem(`${boardId}-sort-ascending`) === "f";
                const sortFieldId = localStorage.getItem(`${boardId}-sort-field-id`) ?? undefined;

                BoardStore.setSortedBy(sortFieldId, !sortDescending);

                const fieldLen = await initFields();

                await initEntries(fieldLen);

                await initWorkspace();
        }
        catch (err) {
                navigate("/dashboard");
                console.error(err);
        }

        supabase.fetchCollaborators(boardId).then(BoardStore.setCollaborators);

        initBottomToolbar();
        initUserManagement();
        initTopToolbar();
        initAutomations();
        initHistory();

        BoardStore.setInitialized();
}
