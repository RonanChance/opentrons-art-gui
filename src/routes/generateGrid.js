import QRCode from 'qrcode';

export function generateGrid(grid_style, radius_mm, grid_spacing_mm, QRCode_text, imageColors) {
    if (grid_style === 'Grid' || grid_style === 'Standard') return grid(radius_mm, grid_spacing_mm);
    else if (grid_style === 'Radial') return radial(radius_mm, grid_spacing_mm);
    else if (grid_style === 'Honeycomb') return honeycomb(radius_mm, grid_spacing_mm);
    else if (grid_style === 'QRCode') return qrcode(radius_mm, grid_spacing_mm, QRCode_text);
    else if (grid_style === 'Image') return image(radius_mm, grid_spacing_mm, imageColors);
}

function grid(radius_mm, grid_spacing_mm) {
    let points = [];
    const center = { x: 0, y: 0 };
    const start = -Math.floor(radius_mm / grid_spacing_mm) * grid_spacing_mm;
    const end = Math.ceil(radius_mm / grid_spacing_mm) * grid_spacing_mm;

    for (let y = start; y <= end; y += grid_spacing_mm) {
        for (let x = start; x <= end; x += grid_spacing_mm) {
            if (Math.sqrt(x * x + y * y) <= radius_mm) {
                points.push({ x: x.toFixed(3), y: y.toFixed(3) });
            }
        }
    }
    return points;
}

function radial(radius_mm, grid_spacing_mm) {
    let points = [];
    const numCircles = Math.floor(radius_mm / grid_spacing_mm); // Number of circles
    points.push({ x: 0, y: 0 });
    for (let i = 1; i <= numCircles; i++) {
        const radius = i * grid_spacing_mm; // Radius of the current circle
        const numPointsOnCircle = Math.floor(2 * Math.PI * radius / grid_spacing_mm); // Number of points around the circle

        for (let j = 0; j < numPointsOnCircle; j++) {
            const angle = (j / numPointsOnCircle) * (2 * Math.PI); // Angle for even distribution of points
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            if (Math.sqrt(x * x + y * y) <= radius_mm) {
                points.push({ x: x.toFixed(3), y: y.toFixed(3) });
            }
        }
    }
    return points;
}

function honeycomb(radius_mm, grid_spacing_mm) {
    let points = [];
    // Honeycomb grid
    const offset = grid_spacing_mm * Math.sqrt(3) / 2; // Vertical offset for honeycomb pattern
    const rows = Math.ceil(radius_mm / offset); // Number of rows to generate (up to radius)

    // Generate the grid points, but don't add the center point here
    for (let row = 1; row <= rows; row++) {
        const yPos = row * offset;

        // Iterate over positive and negative x for each row
        const xRange = Math.floor(radius_mm / grid_spacing_mm);
        for (let i = -xRange; i <= xRange; i++) {
            let xPos = i * grid_spacing_mm;

            // For every other row, apply an offset (half grid_spacing_mm)
            if (row % 2 !== 0) {
                xPos += grid_spacing_mm / 2;
            }

            // Add points for the positive y-position row
            if (Math.sqrt(xPos * xPos + yPos * yPos) <= radius_mm) {
                points.push({ x: xPos.toFixed(3), y: yPos.toFixed(3) });
            }

            // Also check negative y-position row (symmetry)
            if (Math.sqrt(xPos * xPos + (-yPos) * (-yPos)) <= radius_mm) {
                points.push({ x: xPos.toFixed(3), y: -yPos.toFixed(3) });
            }
        }
    }

    // Now generate the center row (y = 0), without duplicating the center point
    const centerRowY = 0;
    const xRange = Math.floor(radius_mm / grid_spacing_mm);
    for (let i = -xRange; i <= xRange; i++) {
        const xPos = i * grid_spacing_mm;
        // Only add the center point if it's not already included
        if (Math.sqrt(xPos * xPos + centerRowY * centerRowY) <= radius_mm) {
            points.push({ x: xPos.toFixed(3), y: centerRowY.toFixed(3) });
        }
    }
    return points;
}

function qrcode(radius_mm, grid_spacing_mm, QRCode_text) {
    let points = [];
    if (!QRCode_text) return points;

    const qr = QRCode.create(QRCode_text, { errorCorrectionLevel: 'H' });

    const modules = qr.modules;
    const size = modules.size;

    const matrix = [];
    for (let y = 0; y < size; y++) {
        const row = [];
        for (let x = 0; x < size; x++) {
            row.push(modules.get(x, y));
        }
        matrix.push(row);
    }

    const half = (size - 1) / 2;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!matrix[y][x]) continue;

            const xPos = (x - half) * grid_spacing_mm;
            const yPos = (half - y) * grid_spacing_mm;

            if (Math.sqrt(xPos * xPos + yPos * yPos) <= radius_mm) {
                points.push({ x: xPos.toFixed(3), y: yPos.toFixed(3) });
            }
        }
    }
    return points;
}

function image(radius_mm, grid_spacing_mm, imageColors) {
    const points = [];
    const size = imageColors.length;
    if (size === 0) return points;

    const half = (size - 1) / 2;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const color = imageColors[y][x];
            if (!color) continue;
            const xPos = (x - half) * grid_spacing_mm;
            const yPos = (half - y) * grid_spacing_mm;
            if (Math.sqrt(xPos * xPos + yPos * yPos) <= radius_mm) {
                points.push({ x: xPos.toFixed(3), y: yPos.toFixed(3), color: color });
            }
        }
    }

    return points;
}