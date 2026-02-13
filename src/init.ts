import { Globals } from "./globals";
import type { Account } from "./types";

export async function initializeApp(): Promise<boolean> {
	const session = await Globals.supabase.getSession();

	if (!session) {
		window.location.href = "/login.html";
		return false;
	}

	Globals.account = await Globals.supabase.upsertAccount({
		avatar_url: session.user.user_metadata.avatar_url,
		email: session.user.user_metadata.email,
		name: session.user.user_metadata.name,
		last_sign_in_date: session.user.user_metadata.last_sign_in_at,
	} as Account);
	return true;
}
