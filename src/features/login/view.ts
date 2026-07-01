import { HTML } from "./html";

export function displayLoginForm() {
        HTML.loading.style.display = 'none';
        HTML.form.style.display = 'block';
        HTML.userInfo.classList.remove('show');
}
