import type { Session, User } from "@supabase/supabase-js";
import { Globals } from "../globals";
import type { Account } from "../types";
import { loadingElem, loginBtn, loginForm, logoutBtn, userInfo } from "./types";

async function handleUserLogin(user: User) {
	Globals.account = await Globals.supabase.upsertAccount({
		avatar_url: user.user_metadata.avatar_url,
		email: user.user_metadata.email,
		name: user.user_metadata.name
	} as Account);
}

function displayLoginForm() {
	loadingElem.style.display = 'none';
	loginForm.style.display = 'block';
	userInfo.classList.remove('show');
}

async function checkSession() {
	const session = await Globals.supabase.getSession();
	if (!session) {
		displayLoginForm();
	} else {
		await handleUserLogin(session.user);
		window.location.href = "index.html";
	}
}

Globals.supabase.onAuthStateChange(async (event, session: Session) => {
	if (event === 'SIGNED_IN' && session?.user) {
		await handleUserLogin(session.user);
	} else if (event === 'SIGNED_OUT') {
		displayLoginForm();
	}
});


loginBtn.addEventListener('click', () => Globals.supabase.googleSignIn());
logoutBtn.addEventListener('click', () => Globals.supabase.signOut());

checkSession();
