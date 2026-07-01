export const apiDocsEvents = {
        visible: Object.assign(
                (detail: boolean) => new CustomEvent("docs-modal:visible", { detail }),
                { type: "docs-modal:visible" }
        )
}
