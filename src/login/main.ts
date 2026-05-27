import type { Session } from "@supabase/supabase-js";
import { Globals } from "../globals";
import { loadingElem, loginBtn, loginForm, logoutBtn, userInfo } from "./types";

function displayLoginForm() {
        loadingElem.style.display = 'none';
        loginForm.style.display = 'block';
        userInfo.classList.remove('show');
}

async function checkSession() {
        const user = await Globals.supabase.getAuthUser();
        if (!user) {
                displayLoginForm();
        } else {
                window.location.href = "index.html";
        }
}

Globals.supabase.onAuthStateChange(async (event, session: Session) => {
        if (event === 'SIGNED_IN' && session?.user) {
                window.location.href = "index.html";
        } else if (event === 'SIGNED_OUT') {
                displayLoginForm();
        }
});


loginBtn.addEventListener('click', () => Globals.supabase.googleSignIn());
logoutBtn.addEventListener('click', () => Globals.supabase.signOut());

checkSession();
