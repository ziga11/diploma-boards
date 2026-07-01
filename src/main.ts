import { supabase } from "./core/api/supabase";
import { closeDialog, initToastLayerManagement } from "./core/utils/dom";
import { navigate } from "./core/utils/router";

window.addEventListener("popstate", () => navigate(window.location.pathname));

document.addEventListener("click", (e: MouseEvent) => {
        const elem = e.target as HTMLElement;
        if (elem instanceof HTMLDialogElement) closeDialog(elem);
})

const page = window.location.href.replace(".html", "");
await navigate(page);
supabase.initRealTime();

document.addEventListener("click", (e) => {
        const btn = (e.target as HTMLElement).closest("dialog .btn-close, dialog .modal-close-btn");
        if (!btn) return;
        closeDialog(btn.closest("dialog") as HTMLDialogElement);
});

initToastLayerManagement();
