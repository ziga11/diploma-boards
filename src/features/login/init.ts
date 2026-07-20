import "./login.css";
import { navigate } from "@/core/utils/router";
import { initLoginEvents } from "./events";
import { isLoggedIn } from "./logic";
import { displayLoginForm } from "./view";

export async function init() {
        const loggedIn = await isLoggedIn();

        if (!loggedIn) {
                displayLoginForm();
                initLoginEvents();
                return;
        }

        navigate("/dashboard");
}
