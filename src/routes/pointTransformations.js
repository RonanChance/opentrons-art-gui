export function shiftPoints(direction, grid_spacing_mm, radius_mm, point_colors) {
    let dx = 0, dy = 0;

    if (direction === "up") dy = grid_spacing_mm;
    else if (direction === "down") dy = -grid_spacing_mm;
    else if (direction === "left") dx = -grid_spacing_mm;
    else if (direction === "right") dx = grid_spacing_mm;

    const shifted = {};

    for (const key in point_colors) {
        const [xStr, yStr] = key.split(",").map(s => s.trim());
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);
        const newX = (x + dx).toFixed(3);
        const newY = (y + dy).toFixed(3);
        if (Math.sqrt(newX * newX + newY * newY) <= radius_mm) {
            shifted[`${newX}, ${newY}`] = point_colors[key];
        }
    }
    return shifted;
}
