import { HTML } from "./html";

export function hexChange(value: string) {
        if (!value.startsWith('#')) {
                value = '#' + value;
        }
        if (/^#[0-9A-F]{6}$/i.test(value)) {
                updateColor(value);
        }
}

export function updateColor(color: string) {
        HTML.editBoard.colorPicker.value = color;
        HTML.editBoard.hexInput.value = color.toUpperCase();

        HTML.editBoard.presetColors.forEach(btn => {
                const sameColor = btn.dataset.color!.toUpperCase() === color.toUpperCase();
                if (sameColor) {
                        btn.classList.add('active');
                } else {
                        btn.classList.remove('active');
                }
        });
}

