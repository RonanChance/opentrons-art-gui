<script>
    import { generateGrid } from './generateGrid.js';
    import { shiftPoints, roundPoint } from './pointTransformations.js';
    import { getPixelHexColors, hexToRgb, rgbToHex, closestNamedColor } from './imageProcessing.js';
    import { onMount, tick } from 'svelte';
    import { browser } from '$app/environment';
    import { page } from '$app/stores';
    import { current_well_colors_import, well_colors, old_well_colors } from '$lib/proteins.js';
    import { fade } from 'svelte/transition';

    // LOCAL COPY
    let current_well_colors = $state({...current_well_colors_import})

    // GRID DATA
    let grid_style = $state('Standard'); // 'Standard', 'Honeycomb', 'Radial', 'QRCode', 'Image'
    let radius_mm = $state(39.9);
    let grid_spacing_mm = $state(3);
    let prev_grid_spacing_mm = $state(3);
    let point_size = $state(1);
    let points = $state({});
    let point_colors = $state({}); // Typical workflow: edit point_colors then call groupByColors()
    let points_by_color = $state({});

    // USER INTERFACE
    let show_outlines = $state(true);
    let current_point = $state({});
    let isDrawing;
    let loadingURLRecord = $state(false);
    let loadingAIRecord = $state(false);
    let uploading = $state(false);
    let current_color = $state('sfGFP');
    let contentToCopy = $state();
    let showBacteriaModal = $state(false);

    // DESIGN METADATA
    let title = $state('');
    let author = $state('');
    let QRCode_text = $state('');
    let estimatedPrintDuration = $state(0);
    
    // IMAGE DATA
    let pixelatedSrc = $state(null);
    let canvasSize = $state(40);
    let pixelationLevel = $state(40);
    let brightness = $state(100);
    let contrast = $state(100);
    let saturation = $state(100);
    let imageColors = $state([]);
    let file = null;
    let img = null;
    let whiteBgReplacement = $state('Invisible');

    // DOWNLOAD DATA
    let scriptType = 'MIT';

    onMount(async () => {
        if (browser) {
            let loadRecordId = $page.url.searchParams.get('id');
            if (loadRecordId) {
                loadRecord(loadRecordId);
            }

            window.addEventListener('keydown', function(event) {
                if ( Object.keys(point_colors).length > 0 && ['Standard', 'Grid', 'Image'].includes(grid_style)) {
                    const directions = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right'};
                    const direction = directions[event.key];
                    if (direction) {
                        event.preventDefault();
                        point_colors = shiftPoints(direction, grid_spacing_mm, grid_spacing_mm, radius_mm, point_colors);
                        groupByColors();
                    }
                }
            });
        }
    });
    
    $effect(() => {
        points = generateGrid(grid_style, radius_mm, grid_spacing_mm, QRCode_text, imageColors);
        tick().then(() => {
            if (grid_style === 'QRCode') {
                    const new_colors = {};
                    for (const point of points) {
                        new_colors[`${point.x}, ${point.y}`] = 'sfGFP';
                    }
                    point_colors = new_colors;
                    groupByColors();
                }
            if (['Standard', 'Grid', 'Image'].includes(grid_style)) {
                const current = grid_spacing_mm;
                const previous = prev_grid_spacing_mm;
                if (current !== previous && !loadingURLRecord) {
                    point_colors = shiftPoints("all", current, previous, radius_mm, point_colors);
                    groupByColors();
                    prev_grid_spacing_mm = current;
                }
            }
            if (grid_style === 'Image') {
                if (img) {
                    const new_colors = {};
                    for (const point of points) {
                        const c =  closestNamedColor(point.color, current_well_colors, well_colors);
                        if (c !== 'White' && c !== 'Erase') {
                            new_colors[`${point.x}, ${point.y}`] = c;
                        } else if ((c === 'White' || c === 'Erase') && whiteBgReplacement !== 'Invisible') {
                            new_colors[`${point.x}, ${point.y}`] = whiteBgReplacement;
                        }
                    }
                    point_colors = new_colors;
                    groupByColors();
                }
            }
        });
    });

    // Toggle blur on sliders
    function blurSlider() {
        if (Object.keys(point_colors).length > 0) {
            return !['Standard', 'Grid', 'QRCode', 'Image'].includes(grid_style)
        }
        return false;
    }

    function resetValues() {
        point_colors = {};
        QRCode_text = '';
        points_by_color = {};
        points = {};
        radius_mm = 40;
        img = null;
        file = null;
        pixelatedSrc = null;
        imageColors = [];
        points = generateGrid(grid_style, radius_mm, grid_spacing_mm);
    }

    async function loadRecord(id) {
        try {
            loadingURLRecord = true;
            const response = await fetch('/loadRecord', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'id': id })
            });
            const r = await response.json();
            grid_spacing_mm = prev_grid_spacing_mm = r.record.grid_spacing_mm;
            radius_mm = r.record.radius_mm;
            point_size = r.record.point_size || 1;
            grid_style = r.record.grid_style;
            
            if (r.record.grid_style === 'Image') {
                brightness = r.record.brightness;
                contrast = r.record.contrast;
                saturation = r.record.saturation;

                pixelationLevel = r.record.pixelation_level;
                canvasSize = r.record.canvas_size;

                processImage(canvasSize, pixelationLevel);
                console.log('pre-existing', point_colors);
            }

            point_colors = r.record.point_colors;
            groupByColors();

            console.log("point-colors", point_colors);
            showAlert("alert-success", "Loaded design successfully!");
        } catch (error) {
            showAlert("alert-warning", "Failed to load design.");
        }
        loadingURLRecord = false;
    }

    async function saveToGallery() {
        uploading = true;
        if (!point_colors || Object.keys(point_colors).length === 0) {
            showAlert("alert-warning", "Design cannot be empty.");
            uploading = false;
            return;
        }

        const response = await fetch('/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                author,
                points,
                grid_style,
                radius_mm,
                grid_spacing_mm,
                point_colors,
                point_size,
                canvasSize,
                pixelationLevel,
                brightness,
                contrast,
                saturation
            })
        });
        let r = await response.json();
        
        if (r.success && !r.duplicate) {
            showAlert("alert-success", "Added to gallery!");
        } else if (r.duplicate) {
            showAlert("alert-warning", "Duplicate submission.");
        } else {
            showAlert("alert-error", "Error: try again later.");
        }
        uploading = false;
        // close the popup modal
        const modal = document.getElementById('upload_modal');
        modal.close();
    }
    
    function groupByColors() {
        const entries = Object.entries(point_colors);

        const uniqueColors = new Set(entries.map(([, color]) => color));

        points_by_color = {};
        for (const color of uniqueColors) {
            const key = `${color.toLowerCase()}_points`;
            points_by_color[key] = entries
                .filter(([, c]) => c === color)
                .map(([point]) => ({
                    point: point.split(',').map(roundPoint),
                    color
                }))
                .sort((a, b) => {
                    const [ax, ay] = a.point;
                    const [bx, by] = b.point;
                    return by - ay || ax - bx;
                });
        }
    }

    async function copyPointsToClipboard() {
        try {
            // Get the content to copy
            let content = contentToCopy.textContent;
            content = content.replace(/\s+/g, ' ');
            content = content.replace(/(\w+_points = \[[^\]]*\])/g, '$1\n');

            // Create a textarea for copying
            const textArea = document.createElement("textarea");
            textArea.value = content;

            // Temporarily add it to the DOM with minimal layout impact
            textArea.style.position = "absolute";
            textArea.style.opacity = "0";
            textArea.style.pointerEvents = "none";
            textArea.style.height = "1px";
            textArea.style.width = "1px";
            textArea.style.margin = "0";

            // Add the textarea to the body, select its content, and copy
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);

        } catch (err) {
            console.log("Failed to copy:", err);
        }
    }
    
    function formatPoints(points) {
        if (!points) return '[]';
        return `[${points.map(p => `(${p.point})`).join(", ")}]`;
    }

    async function downloadPythonFile() {
        // ALL INDIVIDUAL POINTS LISTS
        let python_individual_points_lists = Object.entries(points_by_color).map(([color, points]) => `${color} = ${formatPoints(points)}`).join('\n');
        
        // MAPPING OF POINTS TO COLOR NAMES
        let python_point_name_pairing = `point_name_pairing = [` + Object.entries(points_by_color).map(([color]) => { let nameWithoutSuffix = color.replace(/_points$/, ''); return `("${nameWithoutSuffix}", ${color})`;}).join(',') +`]`;

        // WELL COLORS
        const maxWells = 12;
        const prefix = 'A';
        let well_colors_python_dictionary = Object.entries(points_by_color).slice(0, maxWells).map(([color], i) => {
            const well = `${prefix}${i + 1}`;
            const nameWithoutSuffix = color.replace(/_points$/, '');
            return `    '${well}': '${nameWithoutSuffix}'`;
        });
        const python_well_colors = `well_colors = {\n${well_colors_python_dictionary.join(',\n')}\n}`;

        // VOLUME TRACKING
        let volumeUsedEntries = Object.entries(points_by_color).map(([color]) => {
            const nameWithoutSuffix = color.replace(/_points$/, '');
            return `    '${nameWithoutSuffix}': 0`;
        });
        const volume_used = `volume_used = {\n${volumeUsedEntries.join(',\n')}\n}`;
        let scriptToCopy;

        // WITH THERMOCYCLER SCRIPT
        if (scriptType === 'MIT') {
            scriptToCopy = `from opentrons import types

import string

metadata = {
    'protocolName': '{YOUR NAME} - Opentrons Art - HTGAA',
    'author': 'HTGAA',
    'source': 'HTGAA 2025',
    'apiLevel': '2.20'
}

Z_VALUE_AGAR = 12.1
POINT_SIZE = ${point_size}

${python_individual_points_lists}

${python_point_name_pairing}

# Robot deck setup constants
TIP_RACK_DECK_SLOT = 9
COLORS_DECK_SLOT = 6
AGAR_DECK_SLOT = 5
PIPETTE_STARTING_TIP_WELL = 'A1'

# Place the PCR tubes in this order
${python_well_colors}

${volume_used}

def update_volume_remaining(current_color, quantity_to_aspirate):
    rows = string.ascii_uppercase
    for well, color in list(well_colors.items()):
        if color == current_color:
            if (volume_used[current_color] + quantity_to_aspirate) > 250:
                # Move to next well horizontally by advancing row letter, keeping column number
                row = well[0]
                col = well[1:]
                
                # Find next row letter
                next_row = rows[rows.index(row) + 1]
                next_well = f"{next_row}{col}"
                
                del well_colors[well]
                well_colors[next_well] = current_color
                volume_used[current_color] = quantity_to_aspirate
            else:
                volume_used[current_color] += quantity_to_aspirate
            break

def run(protocol):
    # Load labware, modules and pipettes
    protocol.home()

    # Tips
    tips_20ul = protocol.load_labware('opentrons_96_tiprack_20ul', TIP_RACK_DECK_SLOT, 'Opentrons 20uL Tips')

    # Pipettes
    pipette_20ul = protocol.load_instrument("p20_single_gen2", "right", [tips_20ul])

    # Modules
    temperature_module = protocol.load_module('temperature module gen2', COLORS_DECK_SLOT)

    # Temperature Module Plate
    temperature_plate = temperature_module.load_labware('opentrons_96_aluminumblock_generic_pcr_strip_200ul', 'Cold Plate')

    # Agar Plate
    agar_plate = protocol.load_labware('htgaa_agar_plate', AGAR_DECK_SLOT, 'Agar Plate')
    agar_plate.set_offset(x=0.00, y=0.00, z=Z_VALUE_AGAR)

    # Get the top-center of the plate, make sure the plate was calibrated before running this
    center_location = agar_plate['A1'].top()

    pipette_20ul.starting_tip = tips_20ul.well(PIPETTE_STARTING_TIP_WELL)
    
    # Helper function (dispensing)
    def dispense_and_jog(pipette, volume, location):
        assert(isinstance(volume, (int, float)))
        # Go above the location
        above_location = location.move(types.Point(z=location.point.z + 2))
        pipette.move_to(above_location)
        # Go downwards and dispense
        pipette.dispense(volume, location)
        # Go upwards to avoid smearing
        pipette.move_to(above_location)

    # Helper function (color location)
    def location_of_color(color_string):
        for well,color in well_colors.items():
            if color.lower() == color_string.lower():
                return temperature_plate[well]
        raise ValueError(f"No well found with color {color_string}")

    # Print pattern by iterating over lists
    for i, (current_color, point_list) in enumerate(point_name_pairing):
        # Skip the rest of the loop if the list is empty
        if not point_list:
            continue

        # Get the tip for this run, set the bacteria color, and the aspirate bacteria of choice
        pipette_20ul.pick_up_tip()
        max_aspirate = int(18 // POINT_SIZE) * POINT_SIZE
        quantity_to_aspirate = min(len(point_list)*POINT_SIZE, max_aspirate)
        update_volume_remaining(current_color, quantity_to_aspirate)
        pipette_20ul.aspirate(quantity_to_aspirate, location_of_color(current_color))

        # Iterate over the current points list and dispense them, refilling along the way
        for i in range(len(point_list)):
            x, y = point_list[i]
            adjusted_location = center_location.move(types.Point(x, y))

            dispense_and_jog(pipette_20ul, POINT_SIZE, adjusted_location)
            
            if pipette_20ul.current_volume == 0 and len(point_list[i:]) > 0:
                quantity_to_aspirate = min(len(point_list[i:])*POINT_SIZE, max_aspirate)
                update_volume_remaining(current_color, quantity_to_aspirate)
                pipette_20ul.aspirate(quantity_to_aspirate, location_of_color(current_color))

        # Drop tip between each color
        pipette_20ul.drop_tip()
    `
    }
    // WITHOUT THERMOCYCLER SCRIPT
    if (scriptType === 'LEAHKnox') {
        scriptToCopy = `from opentrons import types

import string

metadata = {
    'protocolName': '{YOUR NAME} - Opentrons Art - HTGAA',
    'author': 'HTGAA',
    'source': 'HTGAA 2025',
    'apiLevel': '2.20'
}

Z_VALUE_AGAR = 2.7
POINT_SIZE = ${point_size}

${python_individual_points_lists}

${python_point_name_pairing}

# Robot deck setup constants
TIP_RACK_DECK_SLOT = 9
COLORS_DECK_SLOT = 6
AGAR_DECK_SLOT = 5
PIPETTE_STARTING_TIP_WELL = 'A1'

# Place the PCR tubes in this order
${python_well_colors}

${volume_used}

def update_volume_remaining(current_color, quantity_to_aspirate):
    rows = string.ascii_uppercase
    for well, color in list(well_colors.items()):
        if color == current_color:
            if (volume_used[current_color] + quantity_to_aspirate) > 250:
                # Move to next well horizontally by advancing row letter, keeping column number
                row = well[0]
                col = well[1:]
                
                # Find next row letter
                next_row = rows[rows.index(row) + 1]
                next_well = f"{next_row}{col}"
                
                del well_colors[well]
                well_colors[next_well] = current_color
                volume_used[current_color] = quantity_to_aspirate
            else:
                volume_used[current_color] += quantity_to_aspirate
            break

def run(protocol):
    # Load labware, modules and pipettes
    protocol.home()

    # Tips
    tips_20ul = protocol.load_labware('opentrons_96_tiprack_20ul', TIP_RACK_DECK_SLOT, 'Opentrons 20uL Tips')

    # Pipettes
    pipette_20ul = protocol.load_instrument("p20_single_gen2", "right", [tips_20ul])

    # Modules
    temperature_plate = protocol.load_labware('opentrons_96_aluminumblock_generic_pcr_strip_200ul', 6)

    # Agar Plate
    agar_plate = protocol.load_labware('htgaa_agar_plate', AGAR_DECK_SLOT, 'Agar Plate')
    agar_plate.set_offset(x=0.00, y=0.00, z=Z_VALUE_AGAR)

    # Get the top-center of the plate, make sure the plate was calibrated before running this
    center_location = agar_plate['A1'].top()

    pipette_20ul.starting_tip = tips_20ul.well(PIPETTE_STARTING_TIP_WELL)
    
    # Helper function (dispensing)
    def dispense_and_jog(pipette, volume, location):
        assert(isinstance(volume, (int, float)))
        # Go above the location
        above_location = location.move(types.Point(z=location.point.z + 2))
        pipette.move_to(above_location)
        # Go downwards and dispense
        pipette.dispense(volume, location)
        # Go upwards to avoid smearing
        pipette.move_to(above_location)

    # Helper function (color location)
    def location_of_color(color_string):
        for well,color in well_colors.items():
            if color.lower() == color_string.lower():
                return temperature_plate[well]
        raise ValueError(f"No well found with color {color_string}")

    # Print pattern by iterating over lists
    for i, (current_color, point_list) in enumerate(point_name_pairing):
        # Skip the rest of the loop if the list is empty
        if not point_list:
            continue

        # Get the tip for this run, set the bacteria color, and the aspirate bacteria of choice
        pipette_20ul.pick_up_tip()
        max_aspirate = int(18 // POINT_SIZE) * POINT_SIZE
        quantity_to_aspirate = min(len(point_list)*POINT_SIZE, max_aspirate)
        update_volume_remaining(current_color, quantity_to_aspirate)
        pipette_20ul.aspirate(quantity_to_aspirate, location_of_color(current_color))

        # Iterate over the current points list and dispense them, refilling along the way
        for i in range(len(point_list)):
            x, y = point_list[i]
            adjusted_location = center_location.move(types.Point(x, y))

            dispense_and_jog(pipette_20ul, POINT_SIZE, adjusted_location)
            
            if pipette_20ul.current_volume == 0 and len(point_list[i:]) > 0:
                quantity_to_aspirate = min(len(point_list[i:])*POINT_SIZE, max_aspirate)
                update_volume_remaining(current_color, quantity_to_aspirate)
                pipette_20ul.aspirate(quantity_to_aspirate, location_of_color(current_color))

        # Drop tip between each color
        pipette_20ul.drop_tip()
    `
    }

        const now = new Date();
        const year = now.getFullYear().toString().slice(2);
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        const timestamp = `${month}-${day}-${year}_${hours}-${minutes}-${seconds}`;
        const filename = `OTDesign_${timestamp}.py`;

        const blob = new Blob([scriptToCopy], { type: "text/x-python" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename; // Use dynamically generated filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url); // Clean up the URL object
    }

    let isToastVisible = $state(false);
    let alertMessage = $state('');
    let alertType = $state('');
	function showAlert(type = "alert-success", msg = "Success!") {
		isToastVisible = true;
        alertMessage = msg;
        alertType = type;
		setTimeout(() => { isToastVisible = false; }, 3000);
	}

    $effect(() => {
        processImage(canvasSize, pixelationLevel, brightness, contrast, saturation);
        if (pixelationLevel > canvasSize) { pixelationLevel = canvasSize; }
    });

    function handleFileChange(event) {
        file = event.target.files[0];
        grid_spacing_mm = 1.8;
        point_size = 0.25;
        canvasSize = 40;
        pixelationLevel = 40;
        brightness = 100;
        contrast = 100;
        saturation = 100;
        whiteBgReplacement = 'Invisible';
        if (!file) return;
        img = new Image();
        img.onload = () => { processImage(canvasSize, pixelationLevel); };
        img.src = URL.createObjectURL(file);
    }

    function processImage(canvasSize, pixelationLevel) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        if (!img) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvasSize, canvasSize);
            // pixelatedSrc = canvas.toDataURL();
            imageColors = getPixelHexColors(ctx, canvasSize, canvasSize);
            return;
        }

        const temp = document.createElement('canvas');
        temp.width = pixelationLevel;
        temp.height = pixelationLevel;
        
        const tempCtx = temp.getContext('2d');
        tempCtx.filter = `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturation}%)`;
        tempCtx.drawImage(img, 0, 0, temp.width, temp.height);

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(temp, 0, 0, temp.width, temp.height, 0, 0, canvasSize, canvasSize);

        pixelatedSrc = canvas.toDataURL();
        imageColors = getPixelHexColors(ctx, canvasSize, canvasSize);
    }

    function formatSeconds(seconds) {
        let totalDuration = 0;
        for (const key in points_by_color) {
            const points = points_by_color[key];
            let curDuration = 0;

            for (let i = 1; i < points.length; i++) {
                const [x1, y1] = points[i - 1].point;
                const [x2, y2] = points[i].point;
                const dx = x2 - x1;
                const dy = y2 - y1;
                // duration: print point
                curDuration += Math.sqrt(dx * dx + dy * dy) / 5;
            }
            totalDuration += curDuration;
            // duration: switch pipette
            totalDuration += 12;
            // duration: refill pipette
            totalDuration +=  Math.ceil(points_by_color[key].length / 18) * 5;
        }
        seconds = totalDuration;
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
</script>

<article class="prose w-full mx-auto mt-5">
    <h2 class="text-center text-neutral">Opentrons Art Interface</h2>
</article>

<dialog id="upload_modal" class="modal modal-middle">
    <div class="modal-box">
        <h3 class="text-lg font-bold">Ready to publish?</h3>
        <p class="pt-3 flex flex-row gap-2 items-center">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M63.99805,140.002a7.99955,7.99955,0,0,1-8,8h-.00049l-44.00147-.0039a8,8,0,0,1-6.3955-12.80469A67.81463,67.81463,0,0,1,33.02783,113.5127,39.99241,39.99241,0,1,1,99.29492,76.50293a7.99971,7.99971,0,0,1-3.78515,8.37695,64.36027,64.36027,0,0,0-27.85889,33.7959A63.645,63.645,0,0,0,63.99805,140.002Zm186.39941-4.81054a67.81009,67.81009,0,0,0-27.42676-21.68067A39.99246,39.99246,0,1,0,156.70361,76.5a8.00092,8.00092,0,0,0,3.78467,8.37695,64.367,64.367,0,0,1,27.85938,33.79688A63.64448,63.64448,0,0,1,192,140a8.00039,8.00039,0,0,0,8.001,8l44.001-.00391a8,8,0,0,0,6.39551-12.80468ZM157.16162,178.0896a48,48,0,1,0-58.32324,0,71.66776,71.66776,0,0,0-35.59522,34.40454A7.9997,7.9997,0,0,0,70.43457,223.999H185.56543a8.00017,8.00017,0,0,0,7.19141-11.50488A71.66776,71.66776,0,0,0,157.16162,178.0896Z"></path> </g></svg>
            Publicly viewable
        </p>
        <p class="pt-2 flex flex-row gap-2 items-center">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="5.12"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M225.25439,82.74512a51.65924,51.65924,0,0,1-15.22949,36.76953L181.74072,147.7998a52.0625,52.0625,0,0,1-73.54,0,8.00053,8.00053,0,0,1,11.31446-11.31445,36.04088,36.04088,0,0,0,50.91211,0l28.2832-28.28515A35.99926,35.99926,0,0,0,147.79932,57.29L128.00049,77.08887A8.00053,8.00053,0,1,1,116.686,65.77441l19.79882-19.79882a51.99951,51.99951,0,0,1,88.76953,36.76953Zm-97.25488,96.166L108.20068,198.71A35.99926,35.99926,0,1,1,57.28955,147.7998l28.2832-28.28515a36.03821,36.03821,0,0,1,50.91211,0,8.00053,8.00053,0,1,0,11.31446-11.31445,52.0625,52.0625,0,0,0-73.54,0L45.9751,136.48535a52.00031,52.00031,0,0,0,73.54,73.53906L139.314,190.22559a8.00053,8.00053,0,0,0-11.31445-11.31446Z"></path> </g></svg>
            Shareable link
        </p>
        <p class="pt-2 flex flex-row gap-2 items-center">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 256.00 256.00" id="Flat" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="5.12"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M80.34375,115.668A8,8,0,0,1,86,102.01074h34V40a8,8,0,0,1,16,0v62.01074h34a8,8,0,0,1,5.65625,13.65723l-42,41.98926a7.99945,7.99945,0,0,1-11.3125,0ZM216,144a8.00039,8.00039,0,0,0-8,8v56H48V152a8,8,0,0,0-16,0v56a16.01833,16.01833,0,0,0,16,16H208a16.01833,16.01833,0,0,0,16-16V152A8.00039,8.00039,0,0,0,216,144Z"></path> </g></svg>
            Access on any device
        </p>

        <div class="flex flex-col w-full gap-2 pt-5">
            <label class="input input-bordered flex items-center gap-2">
                <svg class="h-4 w-4 opacity-70" fill="currentColor" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M46.5,0v139.6h23.3c0-23.3,0-69.8,23.3-93.1c23.2-23.3,46.5-23.3,69.8-23.3h46.5v395.6c0,34.9-11.6,69.8-46.5,69.8l-22.8,0 l-0.5,23.2h232.7v-23.3h-23.3c-34.9,0-46.5-34.9-46.5-69.8V23.3h46.5c23.3,0,46.5,0,69.8,23.3s23.3,69.8,23.3,93.1h23.3V0H46.5z"></path> </g></svg>
                <input type="text" class="grow no-autofill" placeholder="Title (optional)" autocomplete="off" maxlength="120" bind:value={title} />
            </label>
            <label class="input input-bordered flex items-center gap-2">
                <svg class="h-4 w-4 opacity-70" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="currentColor"></path> <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#000000"></path> </g></svg>
                <input type="text" class="grow no-autofill" placeholder="Name (optional)" autocomplete="off" maxlength="25" bind:value={author} />
            </label>
        </div>

        <p class="pt-2 flex flex-row gap-2 items-center justify-center italic text-xs">
            Note: designs are posted the 'All' tab until approved by an admin
        </p>

        <div class="modal-action">
            <form method="dialog">
                <button type="button" class="btn" onclick={saveToGallery}>
                    {#if !uploading}
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 -1.5 35 35" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>upload1</title> <path d="M29.426 15.535c0 0 0.649-8.743-7.361-9.74-6.865-0.701-8.955 5.679-8.955 5.679s-2.067-1.988-4.872-0.364c-2.511 1.55-2.067 4.388-2.067 4.388s-5.576 1.084-5.576 6.768c0.124 5.677 6.054 5.734 6.054 5.734h9.351v-6h-3l5-5 5 5h-3v6h8.467c0 0 5.52 0.006 6.295-5.395 0.369-5.906-5.336-7.070-5.336-7.070z"></path> </g></svg>
                    {:else}
                        <span class="loading loading-spinner loading-xs"></span>
                    {/if}
                    Publish
                </button>
            </form>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
</dialog>

<dialog id="download_modal" class="modal modal-middle">
    <div class="modal-box">
        <h3 class="text-lg font-bold ">Downloads</h3>
        <div class="flex flex-col gap-2 pt-5">
            <button class="btn flex items-center gap-2" onclick={() => {scriptType="MIT"; downloadPythonFile();}}>
                <svg class="w-5 h-5 inline-block align-middle" transform="scale(1.3) translate(-0.5 0)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 5v8.5m0 0l3-3m-3 3l-3-3M5 15v2a2 2 0 002 2h10a2 2 0 002-2v-2" /></svg>
                E14 Media Lab - With Thermocycler
            </button>
            <button class="btn flex items-center gap-2" onclick={() => {scriptType="LEAHKnox"; downloadPythonFile();}}>
                <svg class="w-5 h-5 inline-block align-middle" transform="scale(1.3) translate(-0.5 0)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 5v8.5m0 0l3-3m-3 3l-3-3M5 15v2a2 2 0 002 2h10a2 2 0 002-2v-2" /></svg>
                68 Project Lab - Without Thermocycler
            </button>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
</dialog>

{#if isToastVisible}
    <div role="alert" class="alert {alertType} fixed top-4 left-1/2 -translate-x-1/2 z-20 text-white max-w-[80%] flex px-4 py-2 rounded shadow-lg items-center">
        {#if alertType === 'alert-success'}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        {:else if alertType === 'alert-warning'}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        {/if}
        <span>{alertMessage}</span>
    </div>
{/if}

<!-- MENU BAR -->
<div class="flex flex-row w-full max-w-[100vw] sm:max-w-[490px] mx-auto px-5 pt-3">
    <div class="mr-auto items-center flex flex-row gap-2 opacity-70">
        <label class="swap mr-auto">
            <input type="checkbox" id="toggle-outlines" bind:checked={show_outlines} />
            <svg class="swap-on w-8 h-8 text-neutral" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g data-name="Layer 2"> <g data-name="eye"> <rect width="24" height="24" opacity="0"></rect> <circle cx="12" cy="12" r="1.5"></circle> <path d="M21.87 11.5c-.64-1.11-4.16-6.68-10.14-6.5-5.53.14-8.73 5-9.6 6.5a1 1 0 0 0 0 1c.63 1.09 4 6.5 9.89 6.5h.25c5.53-.14 8.74-5 9.6-6.5a1 1 0 0 0 0-1zm-9.87 4a3.5 3.5 0 1 1 3.5-3.5 3.5 3.5 0 0 1-3.5 3.5z"></path> </g> </g> </g></svg>
            <svg class="swap-off w-8 h-8 text-neutral" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g data-name="Layer 2"> <g data-name="eye-off"> <rect width="24" height="24" opacity="0"></rect> <circle cx="12" cy="12" r="1.5"></circle> <path d="M15.29 18.12L14 16.78l-.07-.07-1.27-1.27a4.07 4.07 0 0 1-.61.06A3.5 3.5 0 0 1 8.5 12a4.07 4.07 0 0 1 .06-.61l-2-2L5 7.87a15.89 15.89 0 0 0-2.87 3.63 1 1 0 0 0 0 1c.63 1.09 4 6.5 9.89 6.5h.25a9.48 9.48 0 0 0 3.23-.67z"></path> <path d="M8.59 5.76l2.8 2.8A4.07 4.07 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 4.07 4.07 0 0 1-.06.61l2.68 2.68.84.84a15.89 15.89 0 0 0 2.91-3.63 1 1 0 0 0 0-1c-.64-1.11-4.16-6.68-10.14-6.5a9.48 9.48 0 0 0-3.23.67z"></path> <path d="M20.71 19.29L19.41 18l-2-2-9.52-9.53L6.42 5 4.71 3.29a1 1 0 0 0-1.42 1.42L5.53 7l1.75 1.7 7.31 7.3.07.07L16 17.41l.59.59 2.7 2.71a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42z"></path> </g> </g> </g></svg>
        </label>
        {#if current_point.x != null && current_point.y != null}
            {roundPoint(current_point.x)}, {roundPoint(current_point.y)}
        {/if}
    </div>
    <a href='/gallery' class="mr-0 flex flex-row gap-2 items-center opacity-70"> Gallery <svg class="w-5 h-5" fill="currentColor" viewBox="0 -0.5 33 33" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>pictures1</title> <path d="M26.604 29.587l-2.624-0.72-0.006-7.258 2.51 0.706 3.619-13.509-18.332-4.912-1.208 4.506h-2.068l1.863-6.952 22.193 5.946-5.947 22.193zM23.039 32h-23.039v-22.977h23.039v22.977zM21.041 11.021h-19.043v13.985h19.043v-13.985zM7.849 20.993l2.283-3.692 2.283 2.301 3.139-4.727 3.283 8.134h-14.556l1.855-3.71 1.713 1.694zM6.484 17.086c-0.828 0-1.499-0.67-1.499-1.498s0.671-1.498 1.499-1.498 1.498 0.67 1.498 1.498-0.67 1.498-1.498 1.498z"></path> </g></svg></a>
</div>

<!-- AGAR PLATE -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="mb-4 flex items-center mx-auto w-full max-w-[94vw] max-h-[94vw] sm:max-w-[460px] sm:max-h-[460px] aspect-square rounded-xl">
    <div class="relative border border-neutral bg-neutral rounded-full mx-auto w-full max-w-[90vw] max-h-[90vw] sm:max-w-[440px] sm:max-h-[440px] aspect-square {loadingURLRecord ? 'blur' : ''} {loadingAIRecord ? 'blur' : ''}"
        onmousedown={() => isDrawing = true}
        onmouseup={() => isDrawing = false}
        onmouseleave={() => {isDrawing = false; current_point = {};}}
        ontouchstart={() => isDrawing = true}
        ontouchend={() => isDrawing = false}
        ontouchcancel={() => isDrawing = false}
        draggable="false"
        id="grid-container"
    >
        {#if grid_style === 'QRCode' && QRCode_text === ''} <div class="flex justify-center items-center h-full opacity-40 text-white">Insert text below</div> {/if}
        
        {#each points as { x, y }}
            <!-- svelte-ignore a11y_mouse_events_have_key_events -->
            <input type="checkbox" id="dot-{x}-{y}"
                class="checkbox
                    {point_size === 0.25 ? 'w-[3px] h-[3px]' : ''}
                    {point_size === 0.5 ? 'w-[6px] h-[6px]' : ''}
                    {point_size === 0.75 ? 'w-[7px] h-[7px]' : ''}
                    {point_size === 1 ? 'w-[8px] h-[8px]' : ''}
                    {point_size === 1.25 ? 'w-[9px] h-[9px]' : ''}
                    {point_size === 1.5 ? 'w-[10px] h-[10px]' : ''}
                    {point_size === 1.75 ? 'w-[11px] h-[11px]' : ''}
                    {point_size === 2 ? 'w-[12px] h-[12px]' : ''} 
                    {point_size === 2.25 ? 'w-[13px] h-[13px]' : ''}
                    {point_size === 2.5 ? 'w-[14px] h-[14px]' : ''} 
                    {point_size === 2.75 ? 'w-[15px] h-[15px]' : ''}
                    {point_size === 3 ? 'w-[16px] h-[16px]' : ''}
                    {point_size === 3.25 ? 'w-[17px] h-[17px]' : ''}
                    {point_size === 3.5 ? 'w-[18px] h-[18px]' : ''}
                    {point_size === 3.75 ? 'w-[19px] h-[19px]' : ''}
                    {point_size === 4 ? 'w-[20px] h-[20px]' : ''}
                    {point_size === 4.25 ? 'w-[21px] h-[21px]' : ''}
                    {point_size === 4.5 ? 'w-[22px] h-[22px]' : ''}
                    {point_size === 4.75 ? 'w-[23px] h-[23px]' : ''}
                    {point_size === 5 ? 'w-[24px] h-[24px]' : ''}
                    absolute rounded-full [--chkfg:invisible] transition-[box-shadow] duration-200 ease-in-out {point_colors[`${x}, ${y}`] ? 'border-0' : 'border-white opacity-15'} {show_outlines ? '' : 'border-0'}"
                style="
                    left: calc(50% + ({x / (radius_mm + 4)} * 50%) - {point_size*2}px); 
                    top: calc(50% - ({y / (radius_mm + 4)} * 50%) - {point_size*2}px);
                    background-color: {well_colors[point_colors[`${x}, ${y}`]] || old_well_colors[point_colors[`${x}, ${y}`]] || 'transparent'};
                    box-shadow: {point_colors[`${x}, ${y}`] ? `0 0 3px 2px ${ well_colors[point_colors[`${x}, ${y}`]] || old_well_colors[point_colors[`${x}, ${y}`]] || 'transparent'}` : 'none'};
                    "
                draggable="false"
                onmouseover={() => {
                    if (isDrawing) {
                        if (current_color === 'Erase') {
                            delete point_colors[`${x}, ${y}`];
                        }
                        else {
                            point_colors[`${x}, ${y}`] = current_color;
                        }
                        groupByColors();
                    }
                    current_point = {x, y}
                }}
                ontouchmove={(e) => {
                    // e.preventDefault(); // Prevent scrolling while drawing
                    const touch = e.touches[0];
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (target && target.id.startsWith("dot-")) {
                        point_colors[`${x}, ${y}`] = current_color;
                        groupByColors();
                    }
                }}
                onclick={() => {
                    if (current_color === 'Erase') {
                        delete point_colors[`${x}, ${y}`];
                    }
                    else if (point_colors[`${x}, ${y}`] === current_color) {
                        delete point_colors[`${x}, ${y}`];
                        current_point = {};
                    } else {
                        point_colors[`${x}, ${y}`] = current_color;
                        current_point = {x, y}
                    }
                    groupByColors();
                }}
            />
        {/each}
        <!-- TIME ESTIMATION -->
        {#if Object.keys(point_colors).length > 0}
            <div class="flex flex-row items-center gap-1 justify-center align-middle absolute top-0 left-0 origin-bottom-left opacity-50 tooltip tooltip-bottom" data-tip="Estimated Print Duration" transition:fade={{ duration: 200 }}>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z" fill="#0F0F0F"></path> <path d="M12 5C11.4477 5 11 5.44771 11 6V12.4667C11 12.4667 11 12.7274 11.1267 12.9235C11.2115 13.0898 11.3437 13.2343 11.5174 13.3346L16.1372 16.0019C16.6155 16.278 17.2271 16.1141 17.5032 15.6358C17.7793 15.1575 17.6155 14.5459 17.1372 14.2698L13 11.8812V6C13 5.44772 12.5523 5 12 5Z" fill="#0F0F0F"></path> </g></svg>
                <div class="">{formatSeconds(estimatedPrintDuration)}</div>
            </div>
        {/if}
        <!-- MOVEMENT KEYS -->
        {#if Object.keys(point_colors).length > 0 && (grid_style === "Standard" || grid_style === "Image")}
            <div class="absolute bottom-0 right-0 scale-[60%] origin-bottom-right" transition:fade={{ duration: 200 }}>
                <div class="flex w-full justify-center">
                    <button class="kbd" onclick={() => {point_colors = shiftPoints("up", grid_spacing_mm, grid_spacing_mm, radius_mm, point_colors); groupByColors();}}>▲</button>
                </div>
                <div class="flex w-full justify-center gap-2 pt-2">
                    <button class="kbd" onclick={() => {point_colors = shiftPoints("left", grid_spacing_mm, grid_spacing_mm, radius_mm, point_colors); groupByColors();}}>◀︎</button>
                    <button class="kbd" onclick={() => {point_colors = shiftPoints("down", grid_spacing_mm, grid_spacing_mm, radius_mm, point_colors); groupByColors();}}>▼</button>
                    <button class="kbd" onclick={() => {point_colors = shiftPoints("right", grid_spacing_mm, grid_spacing_mm, radius_mm, point_colors); groupByColors();}}>▶︎</button>
                </div>
            </div>
        {/if}
    </div>
</div>


<div class="flex flex-col px-5 gap-4 w-full max-w-[100vw] sm:max-w-[500px] mx-auto mb-[150px]">
    
    {#if grid_style === 'QRCode'}
        <div class="relative w-full">
            <svg class="w-5 h-5 absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none opacity-75" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.4437 2.00021C14.9719 1.98733 13.5552 2.55719 12.4986 3.58488L12.4883 3.59504L11.6962 4.38801C11.3059 4.77876 11.3063 5.41192 11.697 5.80222C12.0878 6.19252 12.721 6.19216 13.1113 5.80141L13.8979 5.01386C14.5777 4.35511 15.4855 3.99191 16.4262 4.00014C17.3692 4.00839 18.2727 4.38923 18.9416 5.06286C19.6108 5.73671 19.9916 6.64971 19.9998 7.6056C20.008 8.55874 19.6452 9.47581 18.9912 10.1607L16.2346 12.9367C15.8688 13.3052 15.429 13.5897 14.9453 13.7714C14.4616 13.9531 13.945 14.0279 13.4304 13.9907C12.9159 13.9536 12.4149 13.8055 11.9616 13.5561C11.5083 13.3067 11.1129 12.9617 10.8027 12.5441C10.4734 12.1007 9.847 12.0083 9.40364 12.3376C8.96029 12.6669 8.86785 13.2933 9.19718 13.7367C9.67803 14.384 10.2919 14.9202 10.9975 15.3084C11.7032 15.6966 12.4838 15.9277 13.2866 15.9856C14.0893 16.0435 14.8949 15.9268 15.6486 15.6437C16.4022 15.3606 17.0861 14.9177 17.654 14.3457L20.4168 11.5635L20.429 11.551C21.4491 10.4874 22.0125 9.0642 21.9997 7.58834C21.987 6.11247 21.3992 4.69931 20.3607 3.65359C19.3221 2.60764 17.9155 2.01309 16.4437 2.00021Z" fill="#000000"></path> <path d="M10.7134 8.01444C9.91064 7.95655 9.10506 8.0732 8.35137 8.35632C7.59775 8.63941 6.91382 9.08232 6.34597 9.65431L3.5831 12.4365L3.57097 12.449C2.5508 13.5126 1.98748 14.9358 2.00021 16.4117C2.01295 17.8875 2.60076 19.3007 3.6392 20.3464C4.67787 21.3924 6.08439 21.9869 7.55623 21.9998C9.02807 22.0127 10.4447 21.4428 11.5014 20.4151L11.5137 20.4029L12.3012 19.6099C12.6903 19.218 12.6881 18.5849 12.2962 18.1957C11.9043 17.8066 11.2712 17.8088 10.882 18.2007L10.1011 18.9871C9.42133 19.6452 8.51402 20.0081 7.57373 19.9999C6.63074 19.9916 5.72728 19.6108 5.05834 18.9371C4.38918 18.2633 4.00839 17.3503 4.00014 16.3944C3.99191 15.4412 4.35479 14.5242 5.00874 13.8393L7.76537 11.0633C8.13118 10.6948 8.57097 10.4103 9.05467 10.2286C9.53836 10.0469 10.0549 9.97215 10.5695 10.0093C11.0841 10.0464 11.585 10.1945 12.0383 10.4439C12.4917 10.6933 12.887 11.0383 13.1972 11.4559C13.5266 11.8993 14.1529 11.9917 14.5963 11.6624C15.0397 11.3331 15.1321 10.7067 14.8028 10.2633C14.3219 9.61599 13.708 9.07982 13.0024 8.69161C12.2968 8.30338 11.5161 8.07233 10.7134 8.01444Z" fill="#000000"></path> </g></svg>
            <input type="text" placeholder="QR Code" class="input input-bordered w-full input-sm pl-8 rounded focus:outline-none focus:ring-0" bind:value={QRCode_text} maxlength="500" />
        </div>
    {/if}

    {#if grid_style === 'Image'}
        <div class="relative w-[50%] mr-auto">
            <input type="file" accept="image/*" class="file-input file-input-xs" onclick={(e) => {e.target.value = null;}} onchange={(e) => {handleFileChange(e, pixelationLevel);}} />
        </div>
    {/if}

    {#if pixelatedSrc}
        <div class="flex flex-row w-full gap-4 text-xs bg-gray-100 rounded px-2 py-2">
            <div class="w-[25%] mx-auto my-auto">
                <img src={pixelatedSrc} class="w-full mx-auto outline outline-neutral outline-2 rounded" alt="Pixelated" />
            </div>
            <div class="w-[75%] flex flex-col">
                <div class="flex flex-row w-full gap-3 justify-between">
                    <!-- CANVAS SIZE -->
                    <div class="flex flex-col justify-between items-center gap-1 w-1/3">
                        <span class="font-semibold mr-auto">Canvas</span>
                        <div class="flex items-center gap-2 mr-auto">
                            <span class="opacity-70">{canvasSize}x{canvasSize}px</span>
                            <div class="flex flex-col h-full opacity-70">
                                <button class="button flex-1 p-0 leading-none" onclick={() => {canvasSize += 5}}>▲</button>
                                <button class="button flex-1 p-0 leading-none" onclick={() => {canvasSize -= 5}}>▼</button>
                            </div>
                        </div>
                    </div>
                    <!-- RESOLUTION -->
                    <div class="flex flex-col justify-between items-center gap-1 w-1/3">
                        <span class="font-semibold mr-auto">Resolution</span>
                        <div class="flex items-center gap-2 mr-auto">
                            <span class="opacity-70">{pixelationLevel}px</span>
                            <div class="flex flex-col h-full opacity-70">
                                <button class="button flex-1 p-0 leading-none" onclick={() => {pixelationLevel += 5}}>▲</button>
                                <button class="button flex-1 p-0 leading-none" onclick={() => {pixelationLevel -= 5}}>▼</button>
                            </div>
                        </div>
                    </div>
                    <!-- REPLACE WHITE -->
                    <div class="flex flex-col gap-1 w-1/3">
                        <span class="font-semibold my-auto mr-auto">White</span>
                        <select class="select select-xs mr-auto truncate max-w-24" bind:value={whiteBgReplacement} onchange={() => {processImage(canvasSize, pixelationLevel)}} >
                            <option selected>Invisible</option>
                            {#each Object.entries(current_well_colors).filter(([name, val]) => name !== 'White' &&  name !== "Erase" && val) as [key, value], i}
                                <option>
                                    {key}
                                </option>
                            {/each}
                        </select>
                    </div>
                </div>

                <div class="divider my-0"></div>

                <!-- IMAGE PROCESSING -->
                <div class="flex flex-row w-full gap-3 text-xs">
                    <!-- BRIGHTNESS -->
                    <div class="flex flex-col gap-2 w-1/3">
                        <div class="flex flex-row justify-between">
                            <span class="font-semibold">Brightness</span><span class="opacity-70">{brightness}%</span>
                        </div>
                        <input type="range" min="10" max="300" class="range range-xs" step="10" bind:value={brightness} />
                    </div>
                    <!-- CONTRAST -->
                    <div class="flex flex-col gap-2 w-1/3">
                        <div class="flex flex-row justify-between">
                            <span class="font-semibold">Contrast</span><span class="opacity-70">{contrast}%</span>
                        </div>
                        <input type="range" min="10" max="300" class="range range-xs" step="10" bind:value={contrast} />
                    </div>
                    <!-- SATURATION -->
                    <div class="flex flex-col gap-2 w-1/3">
                        <div class="flex flex-row justify-between">
                            <span class="font-semibold">Saturation</span><span class="opacity-70">{saturation}%</span>
                        </div>
                        <input type="range" min="10" max="300" class="range range-xs" step="10" bind:value={saturation} />
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <div class="flex flex-row w-full gap-6">
        <!-- GRID TYPE -->
        <div class="flex flex-col w-[50%] gap-2 mx-auto">
            <div class="flex flex-row justify-between">
                <span class="font-semibold">Grid</span> <span class="opacity-70">{grid_style}</span>
            </div>
            <div class="flex flex-row justify-between {Object.keys(point_colors).length > 0 ? 'tooltip tooltip-top' : ''}" data-tip="Erase Grid to Edit">
                <button class="btn btn-sm px-2.5 group {grid_style === 'Standard' ? 'btn-neutral' : 'btn-outline'} {Object.keys(point_colors).length > 0 ? 'cursor-not-allowed' : ''}" type="button" onclick={() => {grid_style = "Standard"; grid_spacing_mm = 3; point_size = 1.5;}} aria-label="Standard" disabled={Object.keys(point_colors).length > 0}>
                   <svg class="w-5 h-5 opacity-75" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" /><circle cx="16" cy="8" r="1" fill="currentColor" stroke="none" /><circle cx="8" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="16" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="8" cy="16" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" /><circle cx="16" cy="16" r="1" fill="currentColor" stroke="none" /></svg>
                </button>
                <button class="btn btn-sm px-2.5 group {grid_style === 'Radial' ? 'btn-neutral' : 'btn-outline'} {Object.keys(point_colors).length > 0 ? 'cursor-not-allowed' : ''}" type="button" onclick={() => {grid_style = "Radial"; grid_spacing_mm = 3; point_size = 1.5;}} aria-label="Radial" disabled={Object.keys(point_colors).length > 0}>
                   <svg class="w-5 h-5 opacity-75" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"> <circle cx="12" cy="12" r="10" /> <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" /> <circle cx="15.8" cy="8.8" r="1" fill="currentColor" stroke="none" /> <circle cx="17" cy="12" r="1" fill="currentColor" stroke="none" /> <circle cx="15.8" cy="15.2" r="1" fill="currentColor" stroke="none" /> <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />  <circle cx="8.2" cy="15.2" r="1" fill="currentColor" stroke="none" /> <circle cx="7" cy="12" r="1" fill="currentColor" stroke="none" /> <circle cx="8.2" cy="8.8" r="1" fill="currentColor" stroke="none" /> <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /> </svg>
                </button>
                <button class="btn btn-sm px-2.5 group {grid_style === 'QRCode' ? 'btn-neutral' : 'btn-outline'} {Object.keys(point_colors).length > 0 ? 'cursor-not-allowed' : ''}" type="button" onclick={() => {grid_style = "QRCode"; grid_spacing_mm = 2; point_size = 0.25;}} aria-label="QRCode" disabled={Object.keys(point_colors).length > 0}>
                    <svg class="w-5 h-5 opacity-75" fill="currentColor" height="200px" width="200px" viewBox="0 0 24 24" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> <style>.cls-1{fill:none;}.cls-2{clip-path:url(#clip-path);}</style> <clipPath id="clip-path"> <rect class="cls-1" x="-0.04" width="24" height="24"></rect> </clipPath> </defs> <title>qr-alt</title> <g class="cls-2"> <path d="M9.84,11.17H7.13a1.4,1.4,0,0,1-1.4-1.39V7.07a1.4,1.4,0,0,1,1.4-1.4H9.84a1.4,1.4,0,0,1,1.39,1.4V9.78A1.39,1.39,0,0,1,9.84,11.17ZM7.23,9.67h2.5V7.17H7.23Z"></path> <path d="M16.88,11.17H14.16a1.39,1.39,0,0,1-1.39-1.39V7.07a1.4,1.4,0,0,1,1.39-1.4h2.72a1.4,1.4,0,0,1,1.39,1.4V9.78A1.39,1.39,0,0,1,16.88,11.17Zm-2.61-1.5h2.5V7.17h-2.5Z"></path> <path d="M9.84,18.33H7.13a1.4,1.4,0,0,1-1.4-1.4V14.22a1.4,1.4,0,0,1,1.4-1.39H9.84a1.39,1.39,0,0,1,1.39,1.39v2.71A1.4,1.4,0,0,1,9.84,18.33Zm-2.61-1.5h2.5v-2.5H7.23Z"></path> <path d="M16.88,18.44H14.16a1.39,1.39,0,0,1-1.39-1.39V14.33a1.39,1.39,0,0,1,1.39-1.39h2.72a1.4,1.4,0,0,1,1.39,1.39v2.72A1.39,1.39,0,0,1,16.88,18.44Zm-2.61-1.5h2.5v-2.5h-2.5Z"></path> <path d="M3,8.25a.76.76,0,0,1-.75-.75V3A.76.76,0,0,1,3,2.25H7.5a.75.75,0,0,1,0,1.5H3.75V7.5A.76.76,0,0,1,3,8.25Z"></path> <path d="M21,8.25a.76.76,0,0,1-.75-.75V3.75H16.5a.75.75,0,0,1,0-1.5H21a.76.76,0,0,1,.75.75V7.5A.76.76,0,0,1,21,8.25Z"></path> <path d="M21,21.75H16.5a.75.75,0,0,1,0-1.5h3.75V16.5a.75.75,0,0,1,1.5,0V21A.76.76,0,0,1,21,21.75Z"></path> <path d="M7.5,21.75H3A.76.76,0,0,1,2.25,21V16.5a.75.75,0,0,1,1.5,0v3.75H7.5a.75.75,0,0,1,0,1.5Z"></path> </g> </g></svg>
                </button>
                <button class="btn btn-sm px-2 group {grid_style === 'Image' ? 'btn-neutral' : 'btn-outline'} {Object.keys(point_colors).length > 0 ? 'cursor-not-allowed' : ''}" type="button" onclick={() => {grid_style = "Image"; grid_spacing_mm = 1.8; point_size = 0.25;}} aria-label="Image" disabled={Object.keys(point_colors).length > 0}>
                    <svg class="w-6 h-6 opacity-75" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 10V6C4 4.89543 4.89543 4 6 4H12M4.02693 18.329C4.18385 19.277 5.0075 20 6 20H18C19.1046 20 20 19.1046 20 18V14.1901M4.02693 18.329C4.00922 18.222 4 18.1121 4 18V15M4.02693 18.329L7.84762 14.5083C8.52765 13.9133 9.52219 13.8481 10.274 14.3494L10.7832 14.6888C11.5078 15.1719 12.4619 15.1305 13.142 14.5864L15.7901 12.4679C16.4651 11.9279 17.4053 11.8855 18.1228 12.3484C18.2023 12.3997 18.2731 12.4632 18.34 12.5301L20 14.1901M20 14.1901V6C20 4.89543 19.1046 4 18 4H17M11 9C11 10.1046 10.1046 11 9 11C7.89543 11 7 10.1046 7 9C7 7.89543 7.89543 7 9 7C10.1046 7 11 7.89543 11 9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                </button>
            </div>
        </div>
        <!-- BACTERIA COLOR & CONTROLS -->
        <div class="flex flex-col w-[50%] gap-2 mx-auto">
            <div class="flex flex-row justify-between">
                <span class="font-semibold">Bacteria</span>
                {#if current_color !== 'Erase'}
                    <a class="opacity-70 underline" href={!["sfGFP_mKO2"].includes(current_color) ? `https://www.fpbase.org/protein/${current_color.toLowerCase()}`: null} target="_blank" rel="noopener noreferrer">{current_color}</a>
                {:else}
                    <span class="opacity-70">{current_color}</span>
                {/if}
            </div>
            <div class="grid grid-cols-6 gap-2 place-items-center my-auto">
                {#each Object.entries(current_well_colors).filter(([name, val]) => name !== 'White' && val) as [name]}
                    <div role="radio" tabindex="0" aria-checked={current_color === name} onclick={() => current_color = name} onkeydown={(e) => e.key === 'Enter' && (current_color = name)}
                        class="w-[24px] h-[24px] rounded-full cursor-pointer border-[1px] transition outline-none focus:ring-2 ring-offset-2 flex items-center justify-center"
                        style="background-color: #fffff; border-color: {well_colors[name]}; box-shadow: {current_color === name ? '0 0 0 0px #000 inset' : 'none'};"
                        title={name}
                    >
                        <div
                            class="w-[14px] h-[14px] rounded-full block"
                            style="background-color: {current_color === name ? well_colors[name] : '000'};"
                        ></div>
                    </div>
                {/each}
                <div role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter'} onclick={() => showBacteriaModal = !showBacteriaModal}
                    class="opacity-40 w-[24px] h-[24px] rounded-full cursor-pointer border-[1px] transition outline-none focus:ring-2 ring-offset-2 flex items-center justify-center"
                    style="background-color: #fffff; border-color: #000; box-shadow: {'none'};">
                    <div class="w-[14px] h-[14px] rounded-full block" style="background-color: '000';">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13 3C13 2.44772 12.5523 2 12 2C11.4477 2 11 2.44772 11 3V11H3C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13H11V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V13H21C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11H13V3Z" fill="#0F0F0F"></path> </g></svg>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {#if showBacteriaModal}
        <div class="relative overflow-y-none bg-white border rounded shadow z-10 p-2">
            <button class="absolute -top-2 -left-2 text-gray-500 hover:text-black text-sm bg-neutral rounded-full px-1 py-1" aria-label="close" onclick={() => showBacteriaModal = false}>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="#fff"></path> </g></svg>
            </button>
            <div class="flex justify-around items-center pb-4 pt-2 ">
                <div class="flex italic">Fluorescent Proteins</div>
                <div class="">
                    <div class="join">
                        <button class="btn join-item rounded-l btn-xs hover:bg-neutral hover:text-white" onclick={() => {current_well_colors = {...current_well_colors_import}; if (grid_style === 'Image') {processImage(canvasSize, pixelationLevel);}}}>Default</button>
                        <button class="btn join-itembtn btn-xs hover:bg-neutral hover:text-white" onclick={() => {Object.keys(well_colors).forEach(key => current_well_colors[key] = true); if (grid_style === 'Image') {processImage(canvasSize, pixelationLevel);}}}>All On</button>
                        <button class="btn join-item rounded-r btn-xs hover:bg-neutral hover:text-white" onclick={() => {Object.keys(well_colors).forEach(key => {if (key !== 'White' && key !== 'Erase') { current_well_colors[key] = false;}}); if (grid_style === 'Image') {processImage(canvasSize, pixelationLevel);}}}>All Off</button>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                {#each Object.entries(well_colors).filter(([name, val]) => name !== 'White' && name !== 'Erase') as [key, value], i}
                    <label class="flex items-center justify-between px-2 py-1 border-b border-5 text-sm">
                        <span>{i+1}. {key}</span>
                        <input
                            type="checkbox"
                            bind:checked={current_well_colors[key]}
                            onchange={() => {current_well_colors = { ...current_well_colors }; if (grid_style === 'Image') {processImage(canvasSize, pixelationLevel);}}}
                            class="checkbox checkbox-sm"
                        />
                    </label>
                {/each}
            </div>
        </div>
    {/if}

    <div class="flex flex-row w-full gap-6">
        <!-- GRID SPACING -->
        <div class="flex flex-col w-full gap-2 mx-auto">
            <div class="flex flex-row justify-between">
                <span class="font-semibold">Spacing</span>
                <span class="flex flex-row items-center gap-1">
                    {#if grid_spacing_mm < 2}
                        <button class="tooltip tooltip-top" aria-label="Small spacing alert" data-tip="Small spacing can cause points to merge">
                            <svg class="w-5 h-5t" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18.2202 21.25H5.78015C5.14217 21.2775 4.50834 21.1347 3.94373 20.8364C3.37911 20.5381 2.90402 20.095 2.56714 19.5526C2.23026 19.0101 2.04372 18.3877 2.02667 17.7494C2.00963 17.111 2.1627 16.4797 2.47015 15.92L8.69013 5.10999C9.03495 4.54078 9.52077 4.07013 10.1006 3.74347C10.6804 3.41681 11.3346 3.24518 12.0001 3.24518C12.6656 3.24518 13.3199 3.41681 13.8997 3.74347C14.4795 4.07013 14.9654 4.54078 15.3102 5.10999L21.5302 15.92C21.8376 16.4797 21.9907 17.111 21.9736 17.7494C21.9566 18.3877 21.7701 19.0101 21.4332 19.5526C21.0963 20.095 20.6211 20.5381 20.0565 20.8364C19.4919 21.1347 18.8581 21.2775 18.2202 21.25V21.25Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.8809 17.15C10.8809 17.0021 10.9102 16.8556 10.9671 16.7191C11.024 16.5825 11.1074 16.4586 11.2125 16.3545C11.3175 16.2504 11.4422 16.1681 11.5792 16.1124C11.7163 16.0567 11.8629 16.0287 12.0109 16.03C12.2291 16.034 12.4413 16.1021 12.621 16.226C12.8006 16.3499 12.9398 16.5241 13.0211 16.7266C13.1023 16.9292 13.122 17.1512 13.0778 17.3649C13.0335 17.5786 12.9272 17.7745 12.7722 17.9282C12.6172 18.0818 12.4203 18.1863 12.2062 18.2287C11.9921 18.2711 11.7703 18.2494 11.5685 18.1663C11.3666 18.0833 11.1938 17.9426 11.0715 17.7618C10.9492 17.5811 10.8829 17.3683 10.8809 17.15ZM11.2409 14.42L11.1009 9.20001C11.0876 9.07453 11.1008 8.94766 11.1398 8.82764C11.1787 8.70761 11.2424 8.5971 11.3268 8.5033C11.4112 8.40949 11.5144 8.33449 11.6296 8.28314C11.7449 8.2318 11.8697 8.20526 11.9959 8.20526C12.1221 8.20526 12.2469 8.2318 12.3621 8.28314C12.4774 8.33449 12.5805 8.40949 12.6649 8.5033C12.7493 8.5971 12.8131 8.70761 12.852 8.82764C12.8909 8.94766 12.9042 9.07453 12.8909 9.20001L12.7609 14.42C12.7609 14.6215 12.6808 14.8149 12.5383 14.9574C12.3957 15.0999 12.2024 15.18 12.0009 15.18C11.7993 15.18 11.606 15.0999 11.4635 14.9574C11.321 14.8149 11.2409 14.6215 11.2409 14.42Z" fill="currentColor"></path> </g></svg>
                        </button>
                    {/if}
                    <span class="opacity-70">
                        {grid_spacing_mm}mm
                    </span>
                </span>
            </div>
            <div class="{Object.keys(point_colors).length > 0 && !(grid_style === 'QRCode' || grid_style === 'Standard') ? 'tooltip tooltip-top' : ''}" data-tip="Erase Grid to Edit" >
                <input type="range" min="1" max="7.5" disabled={blurSlider()} class="range {blurSlider() ? 'cursor-not-allowed blur-sm' : ''}" step="0.1" bind:value={grid_spacing_mm} />
            </div>
        </div>
        <!-- POINT SIZE -->
        <div class="flex flex-col w-full gap-2 mx-auto">
            <div class="flex flex-row justify-between">
                <span class="font-semibold">Size</span><span class="opacity-70">{point_size}µL</span>
            </div>
            <input type="range" min="0.25" max="5" class="range" step="0.25" bind:value={point_size} />
        </div>
    </div>

    <!-- ERASE/PUBLISH BUTTON -->
    <div class="flex flex-row justify-between">
        <button class="btn btn-sm hover:bg-neutral hover:text-white" onclick={resetValues}>
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path transform="scale(1.2) translate(-3 -2.5)" fill-rule="evenodd" clip-rule="evenodd" d="M15.0722 3.9967L20.7508 9.83395L17.0544 13.5304L13.0758 17.5H21.0041V19H7.93503L4.00195 15.0669L15.0722 3.9967ZM10.952 17.5L15.4628 12.9994L11.8268 9.3634L6.12327 15.0669L8.55635 17.5H10.952Z" fill="currentColor"></path> </g></svg>
            Reset
        </button>
        <div class="flex flex-row gap-2">
            <button class="btn btn-sm hover:bg-neutral hover:text-white" onclick={download_modal.showModal()}>
                <svg class="w-5 h-5 inline-block align-middle" transform="scale(1.3) translate(-0.5 0)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 5v8.5m0 0l3-3m-3 3l-3-3M5 15v2a2 2 0 002 2h10a2 2 0 002-2v-2" /></svg>
                Python Script
            </button>
            <button class="btn btn-sm hover:bg-neutral hover:text-white" onclick={() => { if (!uploading) {upload_modal.showModal()}}}>
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 35 35" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>upload1</title> <path d="M29.426 15.535c0 0 0.649-8.743-7.361-9.74-6.865-0.701-8.955 5.679-8.955 5.679s-2.067-1.988-4.872-0.364c-2.511 1.55-2.067 4.388-2.067 4.388s-5.576 1.084-5.576 6.768c0.124 5.677 6.054 5.734 6.054 5.734h9.351v-6h-3l5-5 5 5h-3v6h8.467c0 0 5.52 0.006 6.295-5.395 0.369-5.906-5.336-7.070-5.336-7.070z"></path> </g></svg>
                Publish
            </button>
        </div>
    </div>

    <!-- SHOW POINTS -->
    <div class="flex flex-col w-full gap-2 mx-auto bg-gray-100 rounded px-2 {Object.keys(points_by_color).length >= 1 ? 'pb-2' : ''}">
        <div class="flex flex-row justify-between pt-2 items-center">
            <span class="font-semibold">Coordinates</span>
            <div class="flex flex-row flex-wrap justify-end gap-2 max-w-full overflow-hidden">
                <!-- <button class="btn btn-sm px-1 tooltip tooltip-top" aria-label="Swap Colors" data-tip="Swap Colors" onclick={swapColors}>
                    <svg class="w-6 h-6 mx-1 opacity-50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2 6C2 3.79086 3.79086 2 6 2C8.20914 2 10 3.79086 10 6V18C10 20.2091 8.20914 22 6 22C3.79086 22 2 20.2091 2 18V6Z" stroke="currentColor" stroke-width="1.5"></path> <path d="M9.99977 8.24268L13.3134 4.92902C14.8755 3.36692 17.4082 3.36692 18.9703 4.92902C20.5324 6.49112 20.5324 9.02378 18.9703 10.5859L9.30615 20.25" stroke="currentColor" stroke-width="1.5"></path> <path d="M6 22L18 22C20.2091 22 22 20.2091 22 18C22 15.7909 20.2091 14 18 14L15.5 14" stroke="currentColor" stroke-width="1.5"></path> <path d="M7 18C7 18.5523 6.55228 19 6 19C5.44772 19 5 18.5523 5 18C5 17.4477 5.44772 17 6 17C6.55228 17 7 17.4477 7 18Z" stroke="currentColor" stroke-width="1.5"></path> </g></svg>
                </button> -->
                <button class="btn btn-sm px-1 tooltip tooltip-top" aria-label="Copy Points" data-tip="Copy To Clipboard" onclick={copyPointsToClipboard}>
                    <svg class="w-7 h-7 opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M10 8V7C10 6.05719 10 5.58579 10.2929 5.29289C10.5858 5 11.0572 5 12 5H17C17.9428 5 18.4142 5 18.7071 5.29289C19 5.58579 19 6.05719 19 7V12C19 12.9428 19 13.4142 18.7071 13.7071C18.4142 14 17.9428 14 17 14H16M7 19H12C12.9428 19 13.4142 19 13.7071 18.7071C14 18.4142 14 17.9428 14 17V12C14 11.0572 14 10.5858 13.7071 10.2929C13.4142 10 12.9428 10 12 10H7C6.05719 10 5.58579 10 5.29289 10.2929C5 10.5858 5 11.0572 5 12V17C5 17.9428 5 18.4142 5.29289 18.7071C5.58579 19 6.05719 19 7 19Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
                </button>
            </div>
        </div>
        <div class="text-xs" bind:this={contentToCopy}>
            {#if Object.keys(points_by_color).length >= 1}
                {#each Object.entries(points_by_color) as [color, points]}
                    <div>
                        <span class="inline">{color}</span> =
                        [{#each points as {point}, i}
                            ({point[0]}, {point[1]}){#if i < points.length - 1},{/if}
                        {/each}]
                    </div>
                {/each}
            {/if}
        </div>
    </div>

    <!-- ABOUT SECTION -->
    <div class="collapse collapse-arrow pt-4">
        <input type="checkbox" id="section1" class="toggle-checkbox" />
        <label for="section1" class="collapse-title text-lg font-medium">What is Opentrons Art Interface?</label>
        <div class="collapse-content text-sm">
            <p>This website is made for the Opentrons lab of <a class="italic underline" href="https://howtogrowalmostanything.notion.site/htgaa25" target="_blank" rel="noopener noreferrer">'How To Grow (Almost) Anything'</a> (HTGAA), to teach bio-enthusiasts of all backgrounds the principles and skills at the cutting edge of bioengineering and synthetic biology.</p>
        </div>
    </div>
    <div class="collapse collapse-arrow">
        <input type="checkbox" id="section2" class="toggle-checkbox" />
        <label for="section1" class="collapse-title text-lg font-medium">How To Use The Data Points</label>
        <div class="collapse-content">
            <p class="text-left text-sm">You should write a Python script that iterates over each coordinate and dispenses the correct color of bacteria into that location using the <a class="underline" href="https://docs.opentrons.com/v2/">Opentrons API</a>. Remember to switch pipette tips between each color and aspirate liquid as needed!
            <br />
            <br />
            <a class="underline" href="https://docs.google.com/document/d/1VR1ngrwncH4kW80PHKZDGITu4GJbDa7pCE9yCs4YdUU" target="_blank" rel="noopener noreferrer">HTGAA 2025 Opentrons Lab Protocol</a>
            <br />
            <br />
            <a class="underline" href="https://colab.research.google.com/drive/1VoouRH0nqlk09g50rHxOElaLD-SVknYY" target="_blank" rel="noopener noreferrer">HTGAA 2025 Opentrons Lab Colab</a>
        </div>
    </div>
    <div class="collapse collapse-arrow">
        <input type="checkbox" id="section3" class="toggle-checkbox" />
        <label for="section3" class="collapse-title text-lg font-medium">Tips & Tricks for Lab Day</label>
        <div class="collapse-content text-sm">
            <ul class="list-disc pl-5 space-y-2">
                <li><span class="font-semibold">0.5-2µL points with 3-5mm spacing as a starting point</span>: You can experiment with different settings, but be aware that you may get unexpected results.</li>
                <li><span class="font-semibold">Add an offset when necessary</span>: To adjust for varying amounts of agar, apply a vertical offset after loading `agar_plate` in your `run()` function using the `set_offset` method:<br />
                    <span class="italic pl-5">agar_plate.set_offset(x=0.00, y=0.00, z=11.0)</span>
                </li>
                <li><span class="font-semibold">Use a 100mm cell culture dish</span>: The <span class="italic">Thermo Fisher Nunclon Delta Surface Cell Culture Dish 100 (150464)</span> works best with the MIT Lab's 3D-printed holder.</li>
                <li><span class="font-semibold">Take photographs</span>: Document your process thoroughly & keep notes as you go!</li>
            </ul>
        </div>
    </div>
    
    <div class="text-sm px-4 mt-5">
        <div class="max-w-[160px] mx-auto pt-4">
            <a href="https://github.com/RonanChance/opentrons-art-gui" target="_blank" rel="noopener noreferrer" data-value="github" style="border-radius:2px;" class="py-2 px-1 flex justify-center items-center bg-gray-100 hover:bg-neutral hover:text-white text-neutral transition ease-in duration-100 text-center text-sm font-semibold shadow-md focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="mr-2" viewBox="0 0 1792 1792">
                <path d="M896 128q209 0 385.5 103t279.5 279.5 103 385.5q0 251-146.5 451.5t-378.5 277.5q-27 5-40-7t-13-30q0-3 .5-76.5t.5-134.5q0-97-52-142 57-6 102.5-18t94-39 81-66.5 53-105 20.5-150.5q0-119-79-206 37-91-8-204-28-9-81 11t-92 44l-38 24q-93-26-192-26t-192 26q-16-11-42.5-27t-83.5-38.5-85-13.5q-45 113-8 204-79 87-79 206 0 85 20.5 150t52.5 105 80.5 67 94 39 102.5 18q-39 36-49 103-21 10-45 15t-57 5-65.5-21.5-55.5-62.5q-19-32-48.5-52t-49.5-24l-20-3q-21 0-29 4.5t-5 11.5 9 14 13 12l7 5q22 10 43.5 38t31.5 51l10 23q13 38 44 61.5t67 30 69.5 7 55.5-3.5l23-4q0 38 .5 88.5t.5 54.5q0 18-13 30t-40 7q-232-77-378.5-277.5t-146.5-451.5q0-209 103-385.5t279.5-279.5 385.5-103zm-477 1103q3-7-7-12-10-3-13 2-3 7 7 12 9 6 13-2zm31 34q7-5-2-16-10-9-16-3-7 5 2 16 10 10 16 3zm30 45q9-7 0-19-8-13-17-6-9 5 0 18t17 7zm42 42q8-8-4-19-12-12-20-3-9 8 4 19 12 12 20 3zm57 25q3-11-13-16-15-4-19 7t13 15q15 6 19-6zm63 5q0-13-17-11-16 0-16 11 0 13 17 11 16 0 16-11zm58-10q-2-11-18-9-16 3-14 15t18 8 14-14z"></path>
                </svg>
                View on GitHub
            </a>
        </div>
    </div>
</div>