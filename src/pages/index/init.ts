import { initAddBoardEvents } from "@/features/dashboard/add-board/events";
import { initAPIDocs } from "@/features/dashboard/api-docs/init";
import { initAPIKeys } from "@/features/dashboard/api-keys/init";
import { initNotifications } from "@/features/dashboard/notifications/init";
import { initWorkspace } from "@/features/dashboard/workspace/init";
import "/public/styles/index.css"
import { navigate } from "@/core/utils/router";
import { supabase } from "@/core/api/supabase";

export async function initDashboard() {
        try {
                const acc = await supabase.getAccount();
                if (!acc) navigate("/login");

                await initWorkspace();
                initAPIKeys();
                initAPIDocs();
                initNotifications();
                initAddBoardEvents();
        }
        catch (err) { navigate("/login"); }
}
