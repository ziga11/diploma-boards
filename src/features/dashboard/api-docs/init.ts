import { renderEndpoints } from "./view-utils";
import { initAPIDocsEvents } from "./events";
import { supabase } from "@/core/api/supabase";

export async function initAPIDocs() {
        const acc = await supabase.getAccount();
        if (!acc) throw new Error("Account not set");

        initAPIDocsEvents();

        renderEndpoints("boards");
}
