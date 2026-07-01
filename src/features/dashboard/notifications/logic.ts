import { supabase } from "@/core/api/supabase";

export async function setNotificationState(id: string, nId: string, state: string): Promise<string> {
        return await supabase.notificationResponse(id, nId, state as "accepted" | "declined" | "dismissed");
}

export async function fetchNotifications() {
        return await supabase.fetchNotifications();
}

export async function fetchBoard(boardId: string) {
        return await supabase.fetchBoard(boardId);
}
