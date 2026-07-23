import { BoardState } from "../board-state";
import type { Automation } from "./types";
import { supabase } from "@/core/api/supabase";

export async function insertAutomation(automation: Automation): Promise<Automation> {
        return supabase.insertFieldAutomation(automation);
}

export async function deleteAutomation(id: string) {
        return await supabase.deleteFieldAutomation(id);
}

export async function fetchAutomations(): Promise<Array<Automation>> {
        const boardId = BoardState.boardId;
        if (!boardId) throw new Error("Failed to get the boardId");

        return await supabase.fetchFieldAutomations(boardId);
}

export function alreadyExists(a1: Automation): boolean {
        const existingAutomations = BoardState.automations.get(a1.field_id!);
        if (!existingAutomations) return false;

        for (const a2 of existingAutomations) {
                if (a1.url_call == a2.url_call && a1.type == a2.type && a1.automation_id == a2.automation_id) {
                        return true;
                }
        }

        return false;
}
