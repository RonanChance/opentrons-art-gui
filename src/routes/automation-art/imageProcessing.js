export function getPixelHexColors(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const hexColors = [];

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const hex = rgbToHex(r, g, b);
            row.push(hex);
        }
        hexColors.push(row);
    }

    return hexColors;
}

export function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    return [
        (bigint >> 16) & 255,
        (bigint >> 8) & 255,
        bigint & 255
    ];
}

export function rgbToHex(r, g, b) {
    return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
}

export function colorDistance(rgb1, rgb2) {
    const dr = rgb1[0] - rgb2[0];
    const dg = rgb1[1] - rgb2[1];
    const db = rgb1[2] - rgb2[2];
    return dr * dr + dg * dg + db * db;
}

export function closestNamedColor(hex, current_well_colors, well_colors) {
    const target = hexToRgb(hex);
    let minDist = Infinity;
    let closest = null;

    for (const [name, val] of Object.entries(current_well_colors)) {
        if (!val) continue;
        const dist = colorDistance(target, hexToRgb(well_colors[name]));
        if (dist < minDist) {
            minDist = dist;
            closest = name;
        }
    }

    return closest;
}