<script>
    import { generateGrid } from './generateGrid.js';
    import { onMount, tick } from 'svelte';
    import { browser } from '$app/environment';
    import { page } from '$app/stores';
    import { well_colors, well_colors_abbr } from '$lib/constants.js';

    let grid_style = $state('Standard'); // 'Standard' or 'Honeycomb' or 'Radial'
    let radius_mm = $state(40);
    let radius_margin_mm = $state(0.1);
    let grid_spacing_mm = $state(4);
    let point_size = $state(2);
    
    let points = $state({});
    let point_colors = $state({});
    const points_by_color_defaults = {"red_points": [], "green_points": [], "orange_points": []};
    let points_by_color = $state(points_by_color_defaults);

    let show_outlines = $state(true);
    let current_point = $state({});
    let isDrawing;
    let loadingURLRecord = $state(false);
    let loadingAIRecord = $state(false);
    let uploading = $state(false);

    let title = $state('');
    let author = $state('');

    let current_color = $state('Red');
    let contentToCopy = $state();

    let user_design = $state('');
    let AIMode = $state(false);

    onMount(async () => {
        if (browser) {
            let loadRecordId = $page.url.searchParams.get('id');
            if (loadRecordId) {
                loadRecord(loadRecordId);
            }
            AIMode = $page.url.searchParams.get('ai');
        }
    });
    
    $effect(() => {
        points = generateGrid(grid_style, radius_mm, radius_margin_mm, grid_spacing_mm);
        point_colors = {}; 
        points_by_color = points_by_color_defaults;
    });

    function resetValues() {
        point_colors = {};
        points_by_color = points_by_color_defaults;
        points = {};
        grid_style = 'Standard';
        radius_mm = 40;
        radius_margin_mm = 0.1;
        points = generateGrid(grid_style, radius_mm, radius_margin_mm, grid_spacing_mm);
    }

    async function loadValues(i) {
        const record = loadedRecords[i];
        grid_style = record.grid_style;
        grid_spacing_mm = record.grid_spacing_mm;
        radius_margin_mm = record.radius_margin_mm;
        radius_mm = record.radius_mm;
        points = record.points;
        await tick();
        point_colors = record.point_colors;
        groupByColors();
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
            grid_style = r.record.grid_style;
            grid_spacing_mm = r.record.grid_spacing_mm;
            radius_margin_mm = r.record.radius_margin_mm;
            radius_mm = r.record.radius_mm;
            points = r.record.points;
            point_size = r.record.point_size || 4;
            await tick();
            point_colors = r.record.point_colors;
            groupByColors();
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
                grid_style,
                radius_mm,
                radius_margin_mm,
                grid_spacing_mm,
                points,
                point_colors,
                point_size
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
        // Convert object into an array
        const entries = Object.entries(point_colors);

        function processPoints(colorName) {
            return entries
                .filter(([, color]) => color === colorName)
                .map(([point, color]) => ({
                    point: point.split(',').map(roundPoint), 
                    color
                }))
                .sort((a, b) => {
                    // Sort by Y descending, then X ascending
                    const [ax, ay] = a.point;
                    const [bx, by] = b.point;
                    return by - ay || ax - bx;
                });
        }

        points_by_color = {
            red_points: processPoints("Red"),
            green_points: processPoints("Green"),
            orange_points: processPoints("Orange"),
        };
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
        console.log(points_by_color)
        let scriptToCopy = `from opentrons import types

metadata = {
    'protocolName': 'Opentrons Art - HTGAA',
    'author': 'HTGAA',
    'source': 'HTGAA 2025',
    'apiLevel': '2.20'
}

Z_VALUE = 11.45
POINT_SIZE = ${point_size}
red_points = ${formatPoints(points_by_color.red_points)}
green_points = ${formatPoints(points_by_color.green_points)}
orange_points = ${formatPoints(points_by_color.orange_points)}

###   Robot deck setup constants
TIP_RACK_DECK_SLOT = 9
COLORS_DECK_SLOT = 6
AGAR_DECK_SLOT = 5
PIPETTE_STARTING_TIP_WELL = 'A1'

well_colors = {
    'A1' : 'Red',
    'B1' : 'Green',
    'C1' : 'Orange',
}

def run(protocol):
    ###   Load labware, modules and pipettes
    protocol.home()

    # Tips
    tips_20ul = protocol.load_labware('opentrons_96_tiprack_20ul', TIP_RACK_DECK_SLOT, 'Opentrons 20uL Tips')

    # Pipettes
    pipette_20ul = protocol.load_instrument("p20_single_gen2", "right", [tips_20ul])

    # Modules
    temperature_module = protocol.load_module('temperature module gen2', COLORS_DECK_SLOT)

    # Temperature Module Plate
    temperature_plate = temperature_module.load_labware('opentrons_96_aluminumblock_generic_pcr_strip_200ul',
                                                        'Cold Plate')
    temperature_plate.set_offset(x=0.00, y=0.00, z=3.0)

    # Choose where to take the colors from
    color_plate = temperature_plate

    # Agar Plate
    agar_plate = protocol.load_labware('htgaa_agar_plate', AGAR_DECK_SLOT, 'Agar Plate')  ## TA MUST CALIBRATE EACH PLATE!
    agar_plate.set_offset(x=0.00, y=0.00, z=Z_VALUE)

    # Get the top-center of the plate, make sure the plate was calibrated before running this
    center_location = agar_plate['A1'].top()

    pipette_20ul.starting_tip = tips_20ul.well(PIPETTE_STARTING_TIP_WELL)
    
    ### Helper functions
    def dispense_and_jog(pipette, volume, location):
        assert(isinstance(volume, (int, float)))
        # Go above the location
        above_location = location.move(types.Point(z=location.point.z + 2))
        pipette.move_to(above_location)
        # Go downwards and dispense
        pipette.dispense(volume, location)
        # Go upwards to avoid smearing
        pipette.move_to(above_location)

    def location_of_color(color_string):
        for well,color in well_colors.items():
            if color.lower() == color_string.lower():
                return color_plate[well]
        raise ValueError(f"No well found with color {color_string}")

    ### Create Pattern
    color_names = ["Red", "Green", "Orange"]
    for i, point_list in enumerate([red_points, green_points, orange_points]):
        # Skip the rest of the loop if the list is empty
        if not point_list:
            continue

        # Get the tip for this run, set the bacteria color, and the aspirate bacteria of choice
        pipette_20ul.pick_up_tip()
        current_color = color_names[i]
        pipette_20ul.aspirate(min(len(point_list)*POINT_SIZE, 18), location_of_color(current_color))

        # Iterate over the current points list and dispense them, refilling along the way
        for i in range(len(point_list)):
            x, y = point_list[i]
            adjusted_location = center_location.move(types.Point(x, y))

            dispense_and_jog(pipette_20ul, POINT_SIZE, adjusted_location)
            
            if pipette_20ul.current_volume == 0 and len(point_list[i+1:]) > 0:
                pipette_20ul.aspirate(min(len(point_list[i+1:])*POINT_SIZE, 18), location_of_color(current_color))

        # Drop tip between each color
        pipette_20ul.drop_tip()
    `   

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0"); // Ensure 2 digits
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        const timestamp = `${month}-${day}-${year}_${hours}-${minutes}-${seconds}`;
        const filename = `OT2_Art_${timestamp}.py`;

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

    function roundPoint(p) {
        return Math.round(parseFloat(p) * 1000) / 1000;
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

    let AIGenerated2DList;
    async function generateAIDesign() {
        try {
            loadingAIRecord = true;
            point_colors = {};
            points_by_color = points_by_color_defaults;
            
            // sort the points
            points.sort((a, b) => parseFloat(b.x) - parseFloat(a.x));

            // group the points by x value
            const groupedPoints = points.reduce((acc, point) => {
                if (!acc[point.x]) {
                    acc[point.x] = [];
                }
                acc[point.x].push(point);
                return acc;
            }, {});

            const groupedLists = Object.values(groupedPoints);
            groupedLists.forEach(element => {
                console.log(element.length)
            });

            // Step 1: Find the longest list length
            const maxLength = Math.max(...groupedLists.map(group => group.length));

            // Step 2: Create the nxn 2D array and populate it
            const squareMatrix = groupedLists.map(group => {
                const rowLength = group.length;
                const paddingSize = Math.floor((maxLength - rowLength) / 2);

                // Create row with "0" padding on both sides and "_" in the center
                return Array(paddingSize).fill("0")
                    .concat(Array(rowLength).fill("_"))
                    .concat(Array(maxLength - rowLength - paddingSize).fill("0"));
            });

            // Format the grid nicely to send to LLM
            let Formatted2DList = squareMatrix.map(row => JSON.stringify(row)).join("\n");

            const response = await fetch('/generateWithAI', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_design, Formatted2DList })
            });
            let r = await response.json();
            AIGenerated2DList = JSON.parse(r.result);
            AIGenerated2DList = AIGenerated2DList.grid;
            console.log(AIGenerated2DList);
            console.log(AIGenerated2DList.map(row => JSON.stringify(row)).join("\n"));

            convertMatrixToPoints();
            await tick();
            groupByColors();
            await tick();
            loadingAIRecord = false;
            showAlert("alert-success", "Loaded design successfully!");

        } catch (e) {
            console.log(e);
            showAlert("alert-error", "AI generation failed");
            loadingAIRecord = false;
        }
    }
    
    function convertMatrixToPoints() {
        const centerX = Math.floor(AIGenerated2DList[0].length / 2);
        const centerY = Math.floor(AIGenerated2DList.length / 2);

        for (let row = 0; row < AIGenerated2DList.length; row++) {
            for (let col = 0; col < AIGenerated2DList[row].length; col++) {
                const color = AIGenerated2DList[row][col];
                if (color === "B" || color === "R" || color === "Y" || color === "G" || color === "C") {
                    const x = ((col - centerX) * grid_spacing_mm).toFixed(3);
                    const y = ((centerY - row) * grid_spacing_mm).toFixed(3);
                    point_colors[`${x}, ${y}`] = well_colors_abbr[color];
                }
            }
        }
        return point_colors;
    }
</script>

<article class="prose w-full mx-auto mt-5">
    <h2 class="text-center">Opentrons Art Interface</h2>
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
                <svg class="h-4 w-4 opacity-70" fill="#000000" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M46.5,0v139.6h23.3c0-23.3,0-69.8,23.3-93.1c23.2-23.3,46.5-23.3,69.8-23.3h46.5v395.6c0,34.9-11.6,69.8-46.5,69.8l-22.8,0 l-0.5,23.2h232.7v-23.3h-23.3c-34.9,0-46.5-34.9-46.5-69.8V23.3h46.5c23.3,0,46.5,0,69.8,23.3s23.3,69.8,23.3,93.1h23.3V0H46.5z"></path> </g></svg>
                <input type="text" class="grow no-autofill" placeholder="Title (optional)" autocomplete="off" maxlength="120" bind:value={title} />
            </label>
            <label class="input input-bordered flex items-center gap-2">
                <svg class="h-4 w-4 opacity-70" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="#000000"></path> <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#000000"></path> </g></svg>
                <input type="text" class="grow no-autofill" placeholder="Name (optional)" autocomplete="off" maxlength="25" bind:value={author} />
            </label>
        </div>

        <p class="pt-2 flex flex-row gap-2 items-center justify-center italic text-xs">
            Note: designs are in the 'unverified' tab until approved by an admin
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

<div class="flex flex-row w-full max-w-[100vw] sm:max-w-[500px] mx-auto px-5 pt-4">
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
    <a href='/gallery' class="mr-0 flex flex-row gap-2 items-center opacity-70">
        Gallery
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 -0.5 33 33" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>pictures1</title> <path d="M26.604 29.587l-2.624-0.72-0.006-7.258 2.51 0.706 3.619-13.509-18.332-4.912-1.208 4.506h-2.068l1.863-6.952 22.193 5.946-5.947 22.193zM23.039 32h-23.039v-22.977h23.039v22.977zM21.041 11.021h-19.043v13.985h19.043v-13.985zM7.849 20.993l2.283-3.692 2.283 2.301 3.139-4.727 3.283 8.134h-14.556l1.855-3.71 1.713 1.694zM6.484 17.086c-0.828 0-1.499-0.67-1.499-1.498s0.671-1.498 1.499-1.498 1.498 0.67 1.498 1.498-0.67 1.498-1.498 1.498z"></path> </g></svg>
        <!-- <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z" fill="#000000"></path> </g></svg> -->
    </a>
</div>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
    class="relative border border-neutral rounded-full mx-auto w-full max-w-[94vw] max-h-[94vw] sm:max-w-[440px] sm:max-h-[440px] aspect-square mb-6 {loadingURLRecord ? 'blur' : ''} {loadingAIRecord ? 'blur' : ''}"
    onmousedown={() => isDrawing = true}
    onmouseup={() => isDrawing = false}
    onmouseleave={() => {isDrawing = false; current_point = {};}}
    ontouchstart={() => isDrawing = true}
    ontouchend={() => isDrawing = false}
    ontouchcancel={() => isDrawing = false}
    draggable="false"
    id="grid-container"
>
    {#each points as { x, y }}
        <!-- svelte-ignore a11y_mouse_events_have_key_events -->
        <input type="checkbox" id="dot-{x}-{y}"  
            class="checkbox
                {point_size === 0.5 ? 'w-[6px] h-[6px]' : ''}
                {point_size === 1 ? 'w-[8px] h-[8px]' : ''}
                {point_size === 1.5 ? 'w-[10px] h-[10px]' : ''}
                {point_size === 2 ? 'w-[12px] h-[12px]' : ''} 
                {point_size === 2.5 ? 'w-[14px] h-[14px]' : ''} 
                {point_size === 3 ? 'w-[16px] h-[16px]' : ''} 
                {point_size === 3.5 ? 'w-[18px] h-[18px]' : ''}
                {point_size === 4 ? 'w-[20px] h-[20px]' : ''}
                {point_size === 4.5 ? 'w-[22px] h-[22px]' : ''}
                {point_size === 5 ? 'w-[24px] h-[24px]' : ''}
                absolute rounded-full [--chkfg:invisible] transition-[box-shadow] duration-300 ease-in-out {point_colors[`${x}, ${y}`] ? 'border-0' : ''} {show_outlines ? '' : 'border-0'}"
            style=" 
                left: calc(50% + ({x / (radius_mm + 4)} * 50%) - {point_size*2}px); 
                top: calc(50% - ({y / (radius_mm + 4)} * 50%) - {point_size*2}px);
                background-color: {well_colors[point_colors[`${x}, ${y}`]] || 'transparent'};
                box-shadow: {point_colors[`${x}, ${y}`] ? `0 0 3px 2px ${well_colors[point_colors[`${x}, ${y}`]]}` : 'none'}
                "
            draggable="false"
            onmouseover={() => {
                if (isDrawing) {
                    point_colors[`${x}, ${y}`] = current_color;
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
                if (point_colors[`${x}, ${y}`] === current_color) {
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
</div>


<div class="flex flex-col px-5 gap-4 w-full max-w-[100vw] sm:max-w-[500px] mx-auto mb-[150px]">
    <div class="flex flex-row w-full gap-6">
        <!-- GRID TYPE -->
        <div class="flex flex-col w-[50%] gap-2 mx-auto">
            <div class="flex flex-row justify-between">
                <span class="font-semibold">Grid</span> <span class="opacity-70">{grid_style}</span>
            </div>
            <div class="flex flex-row justify-between {Object.keys(point_colors).length > 0 ? 'tooltip tooltip-top' : ''}" data-tip="Reset Grid to Edit">
                <button class="btn btn-sm group {grid_style === 'Standard' ? 'btn-neutral' : 'btn-outline'} {Object.keys(point_colors).length > 0 ? 'cursor-not-allowed blur-sm' : ''}" type="button" onclick={grid_style = "Standard"} aria-label="Standard" disabled={Object.keys(point_colors).length > 0}>
                    <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="miter"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line x1="5.99" y1="6" x2="6" y2="6" stroke-linecap="round" stroke-width="2"></line><line x1="11.99" y1="6" x2="12" y2="6" stroke-linecap="round" stroke-width="2"></line><line x1="17.99" y1="6" x2="18" y2="6" stroke-linecap="round" stroke-width="2"></line><line x1="5.99" y1="12" x2="6" y2="12" stroke-linecap="round" stroke-width="2"></line><line x1="11.99" y1="12" x2="12" y2="12" stroke-linecap="round" stroke-width="2"></line><line x1="17.99" y1="12" x2="18" y2="12" stroke-linecap="round" stroke-width="2"></line><line x1="5.99" y1="18" x2="6" y2="18" stroke-linecap="round" stroke-width="2"></line><line x1="11.99" y1="18" x2="12" y2="18" stroke-linecap="round" stroke-width="2"></line><line x1="17.99" y1="18" x2="18" y2="18" stroke-linecap="round" stroke-width="2"></line></g></svg>
                </button>
                <button class="btn btn-sm group {grid_style === 'Radial' ? 'btn-neutral' : 'btn-outline '} {Object.keys(point_colors).length > 0 ? 'cursor-not-allowed blur-sm' : ''}" type="button" onclick={grid_style = "Radial"} aria-label="Radial" disabled={Object.keys(point_colors).length > 0}>
                    <svg class="w-5 h-5" viewBox="0 0 48 48" id="a" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.f{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;}</style></defs><circle id="b" class="f" cx="24" cy="24" r="8.5"></circle><circle id="c" class="f" cx="24" cy="24" r="11.8"></circle><circle id="d" class="f" cx="24" cy="24" r="18.25"></circle><circle id="e" class="f" cx="24" cy="24" r="21.5"></circle></g></svg>
                </button>
                <button class="btn btn-sm group {grid_style === 'Honeycomb' ? 'btn-neutral' : 'btn-outline'} {Object.keys(point_colors).length > 0 ? 'cursor-not-allowed blur-sm' : ''}" type="button" onclick={grid_style = "Honeycomb"} aria-label="Honeycomb" disabled={Object.keys(point_colors).length > 0}>
                    <svg class="w-5 h-5" fill="currentColor" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M508.203,197.698L435.2,149.03V59.731c0-2.995-1.579-5.769-4.139-7.313l-85.333-51.2c-2.705-1.621-6.084-1.621-8.789,0 L256,49.781L175.061,1.218c-2.705-1.621-6.084-1.621-8.789,0l-85.333,51.2c-2.56,1.544-4.139,4.318-4.139,7.313v89.3L3.797,197.7 C1.425,199.287,0,201.949,0,204.8v102.4c0,2.859,1.425,5.521,3.797,7.1L76.8,362.968v89.297c0,2.995,1.579,5.777,4.139,7.322 l85.333,51.2c1.357,0.811,2.876,1.212,4.395,1.212s3.038-0.401,4.395-1.212L256,462.223l80.939,48.563 c1.357,0.811,2.876,1.212,4.395,1.212c1.519,0,3.038-0.401,4.395-1.212l85.333-51.2c2.56-1.545,4.139-4.326,4.139-7.322v-89.298 l73.003-48.668c2.372-1.579,3.797-4.241,3.797-7.1v-102.4C512,201.948,510.575,199.285,508.203,197.698z M256,348.448 l-62.352-37.411l-14.448-8.669v-92.732l0.42-0.252L256,163.556l76.38,45.828l0.42,0.252v92.732l-14.448,8.669L256,348.448z M341.333,18.481l76.8,46.089v84.198l-76.8,46.08l-76.8-46.08V64.57L341.333,18.481z M93.867,64.57l76.8-46.089l76.8,46.089 v84.198l-76.8,46.08l-76.8-46.08V64.57z M17.067,209.365l68.502-45.668l57.07,34.242l19.495,11.699v92.73l-74.422,44.653 l-2.139,1.283l-68.506-45.67V209.365z M170.667,493.515l-76.8-46.08v-84.197l76.801-46.081l76.799,46.079v84.198L170.667,493.515z M341.333,493.515l-76.8-46.08v-84.198l76.8-46.08l76.8,46.08v84.198L341.333,493.515z M494.933,302.633l-68.506,45.67 l-76.066-45.638l-0.495-0.297v-92.732l76.561-45.935l68.506,45.67V302.633z"></path> </g> </g> </g></svg>
                </button>
            </div>
        </div>
        <!-- BACTERIA COLOR & CONTROLS -->
        <div class="flex flex-col w-[50%] gap-2 mx-auto">
            <div class="flex flex-row justify-between">
                <span class="font-semibold">Bacteria Color</span><span class="opacity-70">{current_color}</span>
            </div>
            <div class="flex flex-row justify-around my-auto">
                <input type="radio" class="radio checked:bg-red-400" value="Red" id="radio-red" bind:group={current_color} />
                <input type="radio" class="radio checked:bg-green-400" value="Green" id="radio-green" bind:group={current_color} />
                <!-- <input type="radio" class="radio checked:bg-blue-400" value="Blue" id="radio-blue" bind:group={current_color} /> -->
                <input type="radio" class="radio checked:bg-orange-400" value="Orange" id="radio-orange" bind:group={current_color} />
                <!-- <input type="radio" class="radio checked:bg-cyan-400" value="Cyan" id="radio-cyan" bind:group={current_color} /> -->
            </div>
        </div>
    </div>

    <div class="flex flex-row w-full gap-6">
        <!-- GRID SPACING -->
        <div class="flex flex-col w-full gap-2 mx-auto">
            <div class="flex flex-row justify-between">
                <span class="font-semibold">Grid Spacing</span>
                <span class="flex flex-row items-center gap-1">
                    {#if grid_spacing_mm < 2}
                        <button class="tooltip tooltip-top" aria-label="Small spacing alert" data-tip="Small spacing can cause points to merge">
                            <svg class="w-5 h-5t" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18.2202 21.25H5.78015C5.14217 21.2775 4.50834 21.1347 3.94373 20.8364C3.37911 20.5381 2.90402 20.095 2.56714 19.5526C2.23026 19.0101 2.04372 18.3877 2.02667 17.7494C2.00963 17.111 2.1627 16.4797 2.47015 15.92L8.69013 5.10999C9.03495 4.54078 9.52077 4.07013 10.1006 3.74347C10.6804 3.41681 11.3346 3.24518 12.0001 3.24518C12.6656 3.24518 13.3199 3.41681 13.8997 3.74347C14.4795 4.07013 14.9654 4.54078 15.3102 5.10999L21.5302 15.92C21.8376 16.4797 21.9907 17.111 21.9736 17.7494C21.9566 18.3877 21.7701 19.0101 21.4332 19.5526C21.0963 20.095 20.6211 20.5381 20.0565 20.8364C19.4919 21.1347 18.8581 21.2775 18.2202 21.25V21.25Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.8809 17.15C10.8809 17.0021 10.9102 16.8556 10.9671 16.7191C11.024 16.5825 11.1074 16.4586 11.2125 16.3545C11.3175 16.2504 11.4422 16.1681 11.5792 16.1124C11.7163 16.0567 11.8629 16.0287 12.0109 16.03C12.2291 16.034 12.4413 16.1021 12.621 16.226C12.8006 16.3499 12.9398 16.5241 13.0211 16.7266C13.1023 16.9292 13.122 17.1512 13.0778 17.3649C13.0335 17.5786 12.9272 17.7745 12.7722 17.9282C12.6172 18.0818 12.4203 18.1863 12.2062 18.2287C11.9921 18.2711 11.7703 18.2494 11.5685 18.1663C11.3666 18.0833 11.1938 17.9426 11.0715 17.7618C10.9492 17.5811 10.8829 17.3683 10.8809 17.15ZM11.2409 14.42L11.1009 9.20001C11.0876 9.07453 11.1008 8.94766 11.1398 8.82764C11.1787 8.70761 11.2424 8.5971 11.3268 8.5033C11.4112 8.40949 11.5144 8.33449 11.6296 8.28314C11.7449 8.2318 11.8697 8.20526 11.9959 8.20526C12.1221 8.20526 12.2469 8.2318 12.3621 8.28314C12.4774 8.33449 12.5805 8.40949 12.6649 8.5033C12.7493 8.5971 12.8131 8.70761 12.852 8.82764C12.8909 8.94766 12.9042 9.07453 12.8909 9.20001L12.7609 14.42C12.7609 14.6215 12.6808 14.8149 12.5383 14.9574C12.3957 15.0999 12.2024 15.18 12.0009 15.18C11.7993 15.18 11.606 15.0999 11.4635 14.9574C11.321 14.8149 11.2409 14.6215 11.2409 14.42Z" fill="#000000"></path> </g></svg>
                        </button>
                    {/if}
                    <span class="opacity-70">
                        {grid_spacing_mm}mm
                    </span>
                </span>
            </div>
            <div class="{Object.keys(point_colors).length > 0 ? 'tooltip tooltip-top' : ''}" data-tip="Reset Grid to Edit" >
                <input type="range" min="1" max="15" disabled={Object.keys(point_colors).length > 0} class="range {Object.keys(point_colors).length > 0 ? 'cursor-not-allowed blur-sm' : ''}" step="0.1" bind:value={grid_spacing_mm} />
            </div>
        </div>
        <!-- GRID MARGIN -->
        <div class="flex flex-col w-full gap-2 mx-auto">
            <div class="flex flex-row justify-between">
                <span class="font-semibold">Point Size</span><span class="opacity-70">{point_size}µL</span>
            </div>
            <input type="range" min="0.5" max="5" class="range" step="0.5" bind:value={point_size} />
        </div>
    </div>

    <!-- SHOW POINTS -->
    <div class="flex flex-col w-full gap-2 mx-auto pb-2 bg-neutral-100 rounded px-2">
        <div class="flex flex-row justify-between pt-2 items-center">
            <span class="font-semibold">Coordinates</span>
            <div class="flex flex-row justify-right gap-2">
                <button class="btn btn-sm px-1 tooltip tooltip-left" aria-label="Copy Points" data-tip="Copy To Clipboard" onclick={copyPointsToClipboard}>
                    <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M10 8V7C10 6.05719 10 5.58579 10.2929 5.29289C10.5858 5 11.0572 5 12 5H17C17.9428 5 18.4142 5 18.7071 5.29289C19 5.58579 19 6.05719 19 7V12C19 12.9428 19 13.4142 18.7071 13.7071C18.4142 14 17.9428 14 17 14H16M7 19H12C12.9428 19 13.4142 19 13.7071 18.7071C14 18.4142 14 17.9428 14 17V12C14 11.0572 14 10.5858 13.7071 10.2929C13.4142 10 12.9428 10 12 10H7C6.05719 10 5.58579 10 5.29289 10.2929C5 10.5858 5 11.0572 5 12V17C5 17.9428 5 18.4142 5.29289 18.7071C5.58579 19 6.05719 19 7 19Z" stroke="#464455" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
                </button>
                <button class="btn btn-sm px-1 tooltip tooltip-left" aria-label="Download Python File" data-tip="Download Python File" onclick={downloadPythonFile}>
                    <svg class="w-7 h-7 opacity-60" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="M12 5v8.5m0 0l3-3m-3 3l-3-3M5 15v2a2 2 0 002 2h10a2 2 0 002-2v-2"></path> </g></svg>
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

    <!-- RESET/PUBLISH BUTTON -->
    <div class="flex flex-row justify-between">
        <!-- <div class="flex flex-col justify-start gap-1.5"> -->
            <button class="btn btn-sm hover:bg-neutral hover:text-white" onclick={() => { if (!uploading) {upload_modal.showModal()}}}>
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 -1.5 35 35" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>upload1</title> <path d="M29.426 15.535c0 0 0.649-8.743-7.361-9.74-6.865-0.701-8.955 5.679-8.955 5.679s-2.067-1.988-4.872-0.364c-2.511 1.55-2.067 4.388-2.067 4.388s-5.576 1.084-5.576 6.768c0.124 5.677 6.054 5.734 6.054 5.734h9.351v-6h-3l5-5 5 5h-3v6h8.467c0 0 5.52 0.006 6.295-5.395 0.369-5.906-5.336-7.070-5.336-7.070z"></path> </g></svg>
                Publish
            </button>
        <!-- </div> -->
        <button class="btn btn-sm hover:bg-neutral hover:text-white" onclick={resetValues}>
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>rotate</title> <path d="M5.966 16.767l4.090-4.090h-2.397c0.022-0.060 0.045-0.119 0.067-0.178 1.422-3.602 4.934-6.15 9.040-6.15 5.366 0 9.716 4.35 9.716 9.715s-4.35 9.716-9.716 9.716c-3.946 0-7.343-2.354-8.863-5.733-0.015-0.031-0.024-0.066-0.039-0.099l-2.605 2.589c0.018 0.030 0.030 0.064 0.048 0.096 0.004 0.007 0.008 0.014 0.012 0.020 2.299 3.972 6.594 6.643 11.513 6.643 7.342 0 13.294-5.952 13.294-13.294s-5.953-13.296-13.295-13.296c-6.138 0-11.303 4.158-12.833 9.812-0.015 0.052-0.020 0.107-0.032 0.159h-2.091l4.091 4.090z"></path> </g></svg>
            Reset Grid
        </button>
    </div>

    {#if grid_style === 'Standard' && grid_spacing_mm >= 3 && AIMode}
        <div class="flex flex-row mt-3 gap-1">
            <input type="text" placeholder="Generate with AI. Example: Apple, Cube, Leaf" class="input input-bordered rounded-sm w-full input-sm" bind:value={user_design} maxlength=150 />
            <button class="btn rounded-sm btn-sm" aria-label="Send to AI" onclick={() => {if (!loadingAIRecord) {generateAIDesign()}}}>
                {#if !loadingAIRecord}
                    <svg class="w-4 h-4" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.6"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.192"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z" fill="#000000"></path> </g></svg>
                {:else}
                    <span class="loading loading-spinner loading-sm"></span>
                {/if}
            </button>
        </div>
    {/if}

    <!-- ABOUT SECTION -->
    <div class="collapse collapse-arrow pt-4">
        <input type="checkbox" id="section1" class="toggle-checkbox" />
        <label for="section1" class="collapse-title text-lg font-medium">What is Opentrons Art Interface?</label>
        <div class="collapse-content text-sm">
            <p>This website is made for the Opentrons recitation of <a class="italic underline" href="https://howtogrowalmostanything.notion.site/htgaa25">'How To Grow (Almost) Anything'</a> (HTGAA), to teach bio-enthusiasts of all backgrounds the principles and skills at the cutting edge of bioengineering and synthetic biology.</p>
        </div>
    </div>
    <div class="collapse collapse-arrow">
        <input type="checkbox" id="section2" class="toggle-checkbox" />
        <label for="section1" class="collapse-title text-lg font-medium">How To Use The Data Points</label>
        <div class="collapse-content">
            <p class="text-left text-sm">You should write a python script that iterates over each coordinate and dispenses the correct color of bacteria into that location using the <a class="underline" href="https://docs.opentrons.com/v2/">Opentrons API</a>. Remember to switch pipette tips between each color and aspirate liquid as needed!
            <br />
            <br />
            <a class="underline" href="https://docs.google.com/document/d/1VR1ngrwncH4kW80PHKZDGITu4GJbDa7pCE9yCs4YdUU">HTGAA 2025 Opentrons Lab Protocol</a>
            <br />
            <br />
            <a class="underline" href="https://colab.research.google.com/drive/1VoouRH0nqlk09g50rHxOElaLD-SVknYY">HTGAA 2025 Opentrons Lab Colab</a>
        </div>
    </div>
    <div class="collapse collapse-arrow">
        <input type="checkbox" id="section3" class="toggle-checkbox" />
        <label for="section3" class="collapse-title text-lg font-medium">Tips & Tricks for Lab Day</label>
        <div class="collapse-content text-sm">
            <ul class="list-disc pl-5 space-y-2">
                <li><span class="font-semibold">1-2µL points with 3-5mm spacing as a starting point</span>: You can experiment with different settings, but be aware that you may get unexpected results.</li>
                <li><span class="font-semibold">Add an offset when necessary</span>: To adjust for varying amounts of agar, apply a vertical offset after loading `agar_plate` in your `run()` function using the `set_offset` method:<br />
                    <span class="italic pl-5">agar_plate.set_offset(x=0.00, y=0.00, z=11.0)</span>
                </li>
                <li><span class="font-semibold">Use a 100mm cell culture dish</span>: The <span class="italic">Thermo Fisher Nunclon Delta Surface Cell Culture Dish 100 (150464)</span> works best with MIT Lab's 3D-printed holder.</li>
                <li><span class="font-semibold">Take photographs</span>: Document your process thoroughly & keep notes as you go!</li>
            </ul>
        </div>
    </div>
    
    <div class="text-sm px-4 mt-5">
        <!-- <p>This project is <a class="underline" href="https://github.com/RonanChance/opentrons-art-gui/blob/main/LICENSE">MIT Licensed</a> and I would love your help in adding new features!</p> -->
        <div class="max-w-[160px] mx-auto pt-4">
            <a href="https://github.com/RonanChance/opentrons-art-gui" target="_blank" data-value="github" style="border-radius:2px;" class="py-2 px-1 flex justify-center items-center bg-neutral-200 hover:bg-neutral hover:text-white text-neutral transition ease-in duration-100 text-center text-sm font-semibold shadow-md focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="mr-2" viewBox="0 0 1792 1792">
                <path d="M896 128q209 0 385.5 103t279.5 279.5 103 385.5q0 251-146.5 451.5t-378.5 277.5q-27 5-40-7t-13-30q0-3 .5-76.5t.5-134.5q0-97-52-142 57-6 102.5-18t94-39 81-66.5 53-105 20.5-150.5q0-119-79-206 37-91-8-204-28-9-81 11t-92 44l-38 24q-93-26-192-26t-192 26q-16-11-42.5-27t-83.5-38.5-85-13.5q-45 113-8 204-79 87-79 206 0 85 20.5 150t52.5 105 80.5 67 94 39 102.5 18q-39 36-49 103-21 10-45 15t-57 5-65.5-21.5-55.5-62.5q-19-32-48.5-52t-49.5-24l-20-3q-21 0-29 4.5t-5 11.5 9 14 13 12l7 5q22 10 43.5 38t31.5 51l10 23q13 38 44 61.5t67 30 69.5 7 55.5-3.5l23-4q0 38 .5 88.5t.5 54.5q0 18-13 30t-40 7q-232-77-378.5-277.5t-146.5-451.5q0-209 103-385.5t279.5-279.5 385.5-103zm-477 1103q3-7-7-12-10-3-13 2-3 7 7 12 9 6 13-2zm31 34q7-5-2-16-10-9-16-3-7 5 2 16 10 10 16 3zm30 45q9-7 0-19-8-13-17-6-9 5 0 18t17 7zm42 42q8-8-4-19-12-12-20-3-9 8 4 19 12 12 20 3zm57 25q3-11-13-16-15-4-19 7t13 15q15 6 19-6zm63 5q0-13-17-11-16 0-16 11 0 13 17 11 16 0 16-11zm58-10q-2-11-18-9-16 3-14 15t18 8 14-14z"></path>
                </svg>
                View on GitHub
            </a>
        </div>
    </div>
</div>