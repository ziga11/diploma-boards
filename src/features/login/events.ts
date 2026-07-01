import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/core/api/supabase";
import { HTML } from "./html";
import { displayLoginForm } from "./view";
import { navigate } from "@/core/utils/router";

export function initLoginEvents() {
        supabase.onAuthStateChange(async (event, session: Session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                        navigate("/dashboard");
                } else if (event === 'SIGNED_OUT') {
                        displayLoginForm();
                }
        });


        HTML.loginBtn.addEventListener('click', () => supabase.googleSignIn());
        HTML.logoutBtn.addEventListener('click', () => supabase.signOut());
}
