import { initWorkspace } from "@/features/board/workspace/init";
import { initBottomToolbarEvents } from "@/features/board/bottom-toolbar/event";
import { initEntries } from "@/features/board/entries/init";
import { initFields } from "@/features/board/fields/init";
import { initTopToolbar } from "@/features/board/top-toolbar/init";
import { initUserManagementEvents } from "@/features/board/user-management/event";
import "/public/styles/board.css"
import { navigate } from "@/core/utils/router";
import { BoardStore } from "@/features/board/board-state";
import { initAutomations } from "@/features/board/automations/init";
import { supabase } from "@/core/api/supabase";
import { initHistoryEvents } from "@/features/board/history/event";

export async function initBoard(props: Record<string, any>) {
        const acc = await supabase.getAccount()
        if (!acc) {
                navigate("/login");
                return;
        }

        const boardId = props["board_id"];

        try {
                const board = await supabase.fetchBoard(boardId);
                BoardStore.setActiveBoard(board);

                const fieldLen = await initFields();
                console.log(fieldLen);

                await initEntries(fieldLen);

                await initWorkspace();
        }
        catch (err) {
                navigate("/dashboard");
                console.error(err);
        }

        supabase.fetchCollaborators(boardId).then(BoardStore.setCollaborators);

        initBottomToolbarEvents();
        initUserManagementEvents();
        initTopToolbar();
        initAutomations();
        initHistoryEvents();

        BoardStore.setInitialized();
}
