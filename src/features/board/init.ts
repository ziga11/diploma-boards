import { supabase } from "@/core/api/supabase";
import { navigate } from "@/core/utils/router";
import { initTopToolbar } from "./top-toolbar/init";
import { initBottomToolbar } from "./bottom-toolbar/init";
import { initHistory } from "./history/init";
import { AutomationsRegistry } from "./automations/registry";
import { FieldsModule } from "./fields/registry";
import { EntryModule } from "./entries/registry";
import { WorkspaceModule } from "./workspace/registry";
import { UsersModule } from "./user-management/registry";

export async function init(props: Record<string, any>) {
        const acc = await supabase.getAccount()
        if (!acc) {
                navigate("/login");
                return;
        }

        const boardId = props["board_id"];

        try {
                await WorkspaceModule.init(boardId);
                initTopToolbar();
                initBottomToolbar();
                initHistory();

                await FieldsModule.init();
                await Promise.all([
                        EntryModule.init(),
                        UsersModule.init(),
                        AutomationsRegistry.init(),
                ]);
        }
        catch (err) {
                navigate("/dashboard");
                console.error(err);
        }
}
