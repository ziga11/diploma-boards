export const topToolbarEvents = {
        applyPermissionRestrictions: Object.assign(
                () => new CustomEvent("top-toolbar:apply-permission-restrictions"),
                { type: "top-toolbar:apply-permission-restrictions" }
        ),

        setBorderColorAndName: Object.assign(
                (detail: { color: string, name: string }) => new CustomEvent("top-toolbar:set-border-and-name", { detail }),
                { type: "top-toolbar:set-border-and-name" }
        )
}
