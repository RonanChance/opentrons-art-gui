export function shiftPoints(direction, new_spacing, old_spacing, radius_mm, point_colors) {
	let dx = 0, dy = 0;

	if (direction === "up") dy = new_spacing;
	else if (direction === "down") dy = -new_spacing;
	else if (direction === "left") dx = -new_spacing;
	else if (direction === "right") dx = new_spacing;

	let shifted = {};
    if (direction === "all") {
        for (const key in point_colors) {
                const [xStr, yStr] = key.split(",").map(s => s.trim());
                const x = parseFloat(xStr);
                const y = parseFloat(yStr);

                let newX, newY;
                const i = Math.round(x / old_spacing);
                const j = Math.round(y / old_spacing);
                newX = (i * new_spacing).toFixed(3);
                newY = (j * new_spacing).toFixed(3);

                if (Math.sqrt(newX * newX + newY * newY) <= radius_mm) {
                    shifted[`${newX}, ${newY}`] = point_colors[key];
                }
            }
    } else {
        for (const key in point_colors) {
            const [xStr, yStr] = key.split(",").map(s => s.trim());
            const x = parseFloat(xStr);
            const y = parseFloat(yStr);
            const newX = (x + dx).toFixed(3);
            const newY = (y + dy).toFixed(3);
            console.log(newX, newY);
            if (Math.sqrt(newX * newX + newY * newY) <= radius_mm) {
                shifted[`${newX}, ${newY}`] = point_colors[key];
            }
        }
    }
	return shifted;
}
