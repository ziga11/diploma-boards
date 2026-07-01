import { BoardStore } from "../board-state";
import type { Automation } from "./types";
import { supabase } from "@/core/api/supabase";

export async function insertAutomation(automation: Automation): Promise<Automation> {
        return supabase.insertFieldAutomation(automation);
}

export async function deleteAutomation(id: string) {
        const automation = await supabase.deleteFieldAutomation(id);
        BoardStore.automations.delete(automation.field_id!);
}

export async function fetchAutomations(): Promise<Array<Automation>> {
        const boardId = BoardStore.boardId;
        if (!boardId) throw new Error("Failed to get the boardId");

        return await supabase.fetchFieldAutomations(boardId);
}

export function alreadyExists(a1: Automation): boolean {
        const existingAutomations = BoardStore.automations.get(a1.field_id!);
        if (!existingAutomations) return false;

        for (const a2 of existingAutomations) {
                if (a1.url_call == a2.url_call && a1.type == a2.type && a1.automation_id == a2.automation_id) {
                        return true;
                }
        }

        return false;
}
