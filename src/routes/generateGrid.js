export function generateGrid(grid_style, radius_mm, radius_margin_mm, grid_spacing_mm) {
    const points = [];
    const adjusted_radius = radius_mm - radius_margin_mm;
    const step = grid_spacing_mm;

    if (grid_style === 'standard') {
        // Regular grid
        for (let y = -adjusted_radius; y <= adjusted_radius; y += step) {
            for (let x = -adjusted_radius; x <= adjusted_radius; x += step) {
                if (Math.sqrt(x * x + y * y) <= adjusted_radius) {
                    points.push({ x, y });
                }
            }
        }
    } else if (grid_style === 'honeycomb') {
        // Honeycomb grid
        const offset = step * Math.sqrt(3) / 2; // Vertical offset for honeycomb pattern
        for (let y = -adjusted_radius; y <= adjusted_radius; y += offset) {
            for (let x = -adjusted_radius; x <= adjusted_radius; x += step) {
                const xOffset = Math.abs(Math.floor(y / offset) % 2) * (step / 2); // Offset every other row
                const xPos = x + xOffset;
                
                if (Math.sqrt(xPos * xPos + y * y) <= adjusted_radius) {
                    points.push({ x: xPos, y });
                }
            }
        }
    } else if (grid_style === 'radial') {
        // Radial (Concentric Circles) grid
        const numCircles = Math.floor(adjusted_radius / step); // Number of circles
        points.push({ x: 0, y: 0 });
        for (let i = 1; i <= numCircles; i++) {
            const radius = i * step; // Radius of the current circle
            const numPointsOnCircle = Math.floor(2 * Math.PI * radius / step); // Number of points around the circle

            for (let j = 0; j < numPointsOnCircle; j++) {
                const angle = (j / numPointsOnCircle) * (2 * Math.PI); // Angle for even distribution of points
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);

                if (Math.sqrt(x * x + y * y) <= adjusted_radius) {
                    points.push({ x, y });
                }
            }
        }
    }
    return points;
}