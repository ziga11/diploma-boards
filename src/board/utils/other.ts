import { Globals } from "../../globals";
import type { FieldHelper } from "../../types";
import { boardElements } from "../types";

export function findFieldHelper(fieldId: number, value: string): FieldHelper | undefined {
        const field = Globals.fields.get(fieldId);
        if (!field || !field.fieldHelpers) {
                return
        }

        for (const fieldHelper of field?.fieldHelpers!) {
                if (fieldHelper.value == value) return fieldHelper;
        }
}

export function initScrollObserver() {
        const container = boardElements.container;

        const updateFade = () => {
                const canScroll = container.scrollWidth > container.clientWidth;
                const isAtEnd = Math.abs(container.scrollLeft) + container.clientWidth >= container.scrollWidth - 10;

                if (!canScroll || isAtEnd) {
                        container.classList.add('is-at-end');
                } else {
                        container.classList.remove('is-at-end');
                }
        };

        updateFade();

        container.addEventListener('scroll', updateFade, { passive: true });
        window.addEventListener('resize', updateFade);
}

export function isValidEmail(email: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email)
}
