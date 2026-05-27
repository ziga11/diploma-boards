import { Globals } from "./globals";
import { getAccount } from "./utils";

export async function initializeApp(): Promise<boolean> {
        const acc = await getAccount();
        if (!acc) {
                return false;
        }

        Globals.account = acc;

        return true;
}
