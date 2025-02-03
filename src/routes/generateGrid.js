export function generateGrid(grid_style, radius_mm, radius_margin_mm, grid_spacing_mm) {
    console.log('GENERATING GRID', grid_spacing_mm)
    const points = [];
    const adjusted_radius = radius_mm - radius_margin_mm;
    const step = grid_spacing_mm;

    if (grid_style === 'Standard') {
        // Regular grid
        const center = { x: 0, y: 0 };
        const start = -Math.floor(adjusted_radius / step) * step;
        const end = Math.ceil(adjusted_radius / step) * step;
    
        for (let y = start; y <= end; y += step) {
            for (let x = start; x <= end; x += step) {
                if (Math.sqrt(x * x + y * y) <= adjusted_radius) {
                    points.push({ x: x.toFixed(3), y: y.toFixed(3) });
                }
            }
        }
    } else if (grid_style === 'Radial') {
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
                    points.push({ x: x.toFixed(3), y: y.toFixed(3) });
                }
            }
        }
    } else if (grid_style === 'Honeycomb') {
        // Honeycomb grid
        const offset = step * Math.sqrt(3) / 2; // Vertical offset for honeycomb pattern
        const rows = Math.ceil(adjusted_radius / offset); // Number of rows to generate (up to radius)
    
        // Generate the grid points, but don't add the center point here
        for (let row = 1; row <= rows; row++) {
            const yPos = row * offset;
    
            // Iterate over positive and negative x for each row
            const xRange = Math.floor(adjusted_radius / step);
            for (let i = -xRange; i <= xRange; i++) {
                let xPos = i * step;
    
                // For every other row, apply an offset (half step)
                if (row % 2 !== 0) {
                    xPos += step / 2;
                }
    
                // Add points for the positive y-position row
                if (Math.sqrt(xPos * xPos + yPos * yPos) <= adjusted_radius) {
                    points.push({ x: xPos.toFixed(3), y: yPos.toFixed(3) });
                }
    
                // Also check negative y-position row (symmetry)
                if (Math.sqrt(xPos * xPos + (-yPos) * (-yPos)) <= adjusted_radius) {
                    points.push({ x: xPos.toFixed(3), y: -yPos.toFixed(3) });
                }
            }
        }
    
        // Now generate the center row (y = 0), without duplicating the center point
        const centerRowY = 0;
        const xRange = Math.floor(adjusted_radius / step);
        for (let i = -xRange; i <= xRange; i++) {
            const xPos = i * step;
    
            // Only add the center point if it's not already included
            if (Math.sqrt(xPos * xPos + centerRowY * centerRowY) <= adjusted_radius) {
                points.push({ x: xPos.toFixed(3), y: centerRowY.toFixed(3) });
            }
        }
    }

    return points;
}