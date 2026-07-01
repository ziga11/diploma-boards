import { getAccount } from "@/core/utils/utils";
import { renderEndpoints } from "./view-utils";
import { initAPIDocsEvents } from "./events";

export async function initAPIDocs() {
        const acc = await getAccount();
        if (!acc) throw new Error("Account not set");

        initAPIDocsEvents();

        renderEndpoints("boards");
}
