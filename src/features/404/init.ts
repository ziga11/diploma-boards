import { navigate } from "@/core/utils/router";
import "./404.css";

export async function init() {
        const backBtn = document.querySelector("#page-404 .btn-back") as HTMLAnchorElement;

        backBtn.addEventListener("click", () => {
                if (history.length < 3) {
                        history.replaceState(null, '', '/dashboard');

                        navigate('/dashboard');
                } else {
                        history.replaceState(null, '', '/dashboard');

                        history.go(-2);
                }
        });
}
