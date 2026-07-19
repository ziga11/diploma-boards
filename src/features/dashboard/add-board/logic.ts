import { supabase } from "@/core/api/supabase";
import type { Board } from "./types";

export async function insertBoard(board: Board): Promise<void> {
        const acc = await supabase.getAccount();
        if (!acc || !acc.id) throw new Error("Not logged in, or the account variable not set");

        if ([board.name, board.color].includes(undefined) || [board.name?.trim(), board.color?.trim()].includes("")) {
                throw new Error(`name or color not set`)
        }

        return await supabase.insertBoard(board);
}
