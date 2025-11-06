export function shiftPoints(direction, new_spacing, old_spacing, radius_mm, point_colors, grid_style) {
    let dx = 0, dy = 0;

    // Echo384 grid specs
    const rows = 16;
    const cols = 24;
    const echoXSpacing = 5;
    const echoYSpacing = 5;
    const maxX = (cols - 1) * echoXSpacing;
    const maxY = (rows - 1) * echoYSpacing;

    if (grid_style === "Echo384" || grid_style === "Echo384FromImage") {
        if (direction === "up") dy = -echoYSpacing;
        else if (direction === "down") dy = echoYSpacing;
        else if (direction === "left") dx = -echoXSpacing;
        else if (direction === "right") dx = echoXSpacing;
    } else {
        if (direction === "up") dy = new_spacing;
        else if (direction === "down") dy = -new_spacing;
        else if (direction === "left") dx = -new_spacing;
        else if (direction === "right") dx = new_spacing;
    }

    let shifted = {};

    if (direction === "all") {
        for (const key in point_colors) {
            const [xStr, yStr] = key.split(",").map(s => s.trim());
            const x = parseFloat(xStr);
            const y = parseFloat(yStr);

            let newX, newY;
            if (grid_style.startsWith("Echo384")) {
                const i = Math.round(x / echoXSpacing);
                const j = Math.round(y / echoYSpacing);
                newX = Math.max(0, Math.min(i * echoXSpacing, maxX)).toFixed(3);
                newY = Math.max(0, Math.min(j * echoYSpacing, maxY)).toFixed(3);
            } else {
                const i = Math.round(x / old_spacing);
                const j = Math.round(y / old_spacing);
                newX = (i * new_spacing).toFixed(3);
                newY = (j * new_spacing).toFixed(3);
            }

            shifted[`${newX}, ${newY}`] = point_colors[key];
        }
    } else {
        for (const key in point_colors) {
            const [xStr, yStr] = key.split(",").map(s => s.trim());
            const x = parseFloat(xStr);
            const y = parseFloat(yStr);

            let newX = x + dx;
            let newY = y + dy;

            if (grid_style.startsWith("Echo384")) {
                newX = Math.max(0, Math.min(newX, maxX));
                newY = Math.max(0, Math.min(newY, maxY));
            } else {
                if (Math.sqrt(newX * newX + newY * newY) > radius_mm) continue;
            }

            shifted[`${newX.toFixed(3)}, ${newY.toFixed(3)}`] = point_colors[key];
        }
    }

    return shifted;
}


export function roundPoint(p) {
    return Math.round(parseFloat(p) * 1000) / 1000;
}