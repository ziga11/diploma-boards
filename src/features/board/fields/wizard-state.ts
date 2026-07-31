interface DragInterface {
        field1?: HTMLDivElement,
        field2?: HTMLDivElement,
        field1Rect?: DOMRect,
        leeway: number,
        isDragging: boolean
}

interface ResizeInterface {
        field?: HTMLDivElement,
        startRect?: DOMRect,
        newWidth?: number,
        isResizing: boolean,
}

interface WizardState {
        resize: ResizeInterface,
        drag: DragInterface,
}

const state: WizardState = {
        resize: { isResizing: false },
        drag: { isDragging: false, leeway: 0 },
};

export const FieldsWizard = {
        setDraft(partial: Partial<WizardState>) {
                Object.assign(state, partial);
        },

        getResizeState() {
                return state.resize;
        },

        getDragState() {
                return state.drag;
        },

        reset() {
                state.resize = { isResizing: false };
                state.drag = { isDragging: false, leeway: 0 };
        }
};
