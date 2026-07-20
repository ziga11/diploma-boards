import "./dashboard.css";
import { supabase } from "@/core/api/supabase";
import { navigate } from "@/core/utils/router";
import { initWorkspace } from "./workspace/init";
import { initAPIKeys } from "./api-keys/init";
import { initAPIDocs } from "./api-docs/init";
import { initNotifications } from "./notifications/init";
import { initAddBoardEvents } from "./add-board/events";

export async function init() {
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
