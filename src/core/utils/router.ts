import { init404 } from "@/features/404/init";
import { initBoard } from "@/pages/board/init";
import { pageContent } from "@/pages/content";
import { initDashboard } from "@/pages/index/init";
import { loginInit } from "@/pages/login/init";
import { setStateClass } from "./dom";

async function getRoute(path: string, props?: Record<string, any>): Promise<() => Promise<void>> {
        switch (path) {
                case "/board":
                        return () => initBoard(props!);
                case "/login":
                        return () => loginInit();
                case "/404":
                        return () => init404();
                case "/dashboard":
                default:
                        return () => initDashboard();
        }
}

export async function navigate(path: string) {
        history.pushState({}, "", path);

        const { pathname, searchParams } = new URL(path, window.location.origin);
        const props = Object.fromEntries(searchParams.entries());

        const isInitialized = setActivePage(pathname);

        if (isInitialized && pathname != "/board") return;

        const init = await getRoute(pathname, props);

        await init();
}

function setActivePage(pathname: string): boolean {
        const path = ["/board", "/login", "/404"].includes(pathname) ? pathname : "/dashboard";
        const cleanPath = path.replace("/", "");
        const body = document.querySelector("body") as HTMLBodyElement;

        const oldPage = body.querySelector(`.page-class.shown`)
        if (oldPage?.id == `page-${cleanPath}`) throw new Error("Already same page");

        let newPage = body.querySelector(`#page-${cleanPath}`)
        let isInitialized = true;
        if (!newPage) {
                isInitialized = false;
                newPage = pageContent[cleanPath];

                body.appendChild(newPage);
        }

        setStateClass([newPage], [oldPage], "shown");

        return isInitialized;
}
