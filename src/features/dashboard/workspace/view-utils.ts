export function getDominantColor(imgElement: HTMLImageElement) {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(imgElement, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

        const rn = r / 255, gn = g / 255, bn = b / 255;
        const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
        const l = (max + min) / 2;
        const d = max - min;
        let h = 0, s = 0;

        if (d !== 0) {
                s = d / (1 - Math.abs(2 * l - 1));
                switch (max) {
                        case rn: h = ((gn - bn) / d) % 6; break;
                        case gn: h = (bn - rn) / d + 2; break;
                        case bn: h = (rn - gn) / d + 4; break;
                }
                h = Math.round(h * 60);
                if (h < 0) h += 360;
        }

        return `hsl(${h}, ${Math.min(s * 120, 100)}%, 25%)`;
}
