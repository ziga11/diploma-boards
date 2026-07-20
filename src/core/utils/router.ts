import { setStateClass } from "./dom";

const pages: Record<string, () => Promise<PageModule>> = {
        dashboard: async () => ({
                html: (await import("@/pages/dashboard.html?raw")).default,
                init: (await import("@/features/dashboard/init.ts")).init
        }),
        board: async () => ({
                html: (await import("@/pages/board.html?raw")).default,
                init: (await import("@/features/board/init.ts")).init
        }),
        login: async () => ({
                html: (await import("@/pages/login.html?raw")).default,
                init: (await import("@/features/login/init.ts")).init
        }),
        "404": async () => ({
                html: (await import("@/pages/404.html?raw")).default,
                init: (await import("@/features/404/init.ts")).init
        })
};


export async function navigate(path: string) {
        history.pushState({}, "", path);

        const { pathname, searchParams } = new URL(path, window.location.origin);
        const props = Object.fromEntries(searchParams.entries());

        const routeKey = ["/board", "/login", "/404"].includes(pathname)
                ? pathname.replace("/", "")
                : "dashboard";

        const loadPage = pages[routeKey];
        if (!loadPage) return navigate("/404");

        const { html, init } = await loadPage();

        const isInitialized = setActivePage(routeKey, html);

        if (isInitialized && routeKey !== "board") return;

        await init(props);
}

function setActivePage(routeKey: string, htmlString: string): boolean {
        const body = document.querySelector("body") as HTMLBodyElement;

        const oldPage = body.querySelector(`.page-class.shown`);
        if (oldPage?.id === `page-${routeKey}`) throw new Error("Already same page");

        let page = body.querySelector(`#page-${routeKey}`);
        const existingPage = page != null;

        let isInitialized = true;

        if (!existingPage) {
                isInitialized = false;
                page = Object.assign(document.createElement("div"), {
                        className: "page-class",
                        id: `page-${routeKey}`,
                        innerHTML: htmlString
                });
                body.appendChild(page);
        }

        setStateClass([page], [oldPage], "shown");

        return isInitialized;
}
