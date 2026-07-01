import { getAccount } from "@/core/utils/utils";
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
import { initHistory } from "@/features/board/history/init";

export async function initBoard(props: Record<string, any>) {
        const acc = await getAccount()
        if (!acc) {
                navigate("/login");
                return;
        }

        const success = await initWorkspace(props);
        if (!success) {
                navigate("/404");
                return;
        }

        const fieldLen = await initFields();
        await initEntries(fieldLen);

        initBottomToolbarEvents();
        initUserManagementEvents();
        initTopToolbar();
        initAutomations();
        initHistory();

        BoardStore.setInitialized();
}
