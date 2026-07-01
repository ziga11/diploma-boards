export const bottomToolbarEvents = {
        visible: Object.assign(
                (detail: { visible: boolean, checkedCount: number }) => new CustomEvent("bottom-toolbar:visible", { detail }),
                { type: "bottom-toolbar:visible" }
        )
};
