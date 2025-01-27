<script>
    import { generateGrid } from './generateGrid.js';
    let grid_style = $state('standard'); // 'standard' or 'honeycomb' or 'radial'
    let radius_mm = $state(40);
    let radius_margin_mm = $state(2);
    let grid_spacing_mm = $state(4);
    
    let points = $state({});
    let point_colors = $state({});
    const points_by_color_defaults = {"blue_points": [], "red_points": [], "yellow_points": [], "green_points": [], "cyan_points": []};
    let points_by_color = $state(points_by_color_defaults);

    let show_outlines = $state(true);
    let current_point = $state({});

    let current_color = $state('Blue');
    const well_colors = {
        'Blue' : '#93c5fd', // blue-300
        'Red' : '#fca5a5', // red-300
        'Yellow' : '#fde047', // yellow-300
        'Green' : '#86efac', // green-300
        'Cyan' : '#67e8f9', // cyan-300
    }
    let contentToCopy;
    let scriptToCopy = `color_names = ["Blue", "Red", "Yellow", "Green", "Cyan"]
for i, point_list in enumerate([blue_points, red_points, yellow_points, green_points, cyan_points]):
    # Skip the rest of the loop if the list is empty
    if not point_list:
        continue

    # Get the tip for this run, set the bacteria color, and the aspirate bacteria of choice
    pipette_20ul.pick_up_tip()
    current_color = color_names[i]
    pipette_20ul.aspirate(min(len(point_list), 20), location_of_color(current_color))

    # Iterate over the current points list and dispense them, refilling along the way
    for i in range(len(point_list)):
        x, y = point_list[i]
        adjusted_location = center_location.move(types.Point(x, y))
        dispense_and_jog(pipette_20ul, 1, adjusted_location)
        if pipette_20ul.current_volume == 0 and len(point_list[i+1:]) > 0:
            pipette_20ul.aspirate(min(len(point_list[i+1:]), 20), location_of_color(current_color))

    # Drop tip between each color
    pipette_20ul.drop_tip()`;
    
    $effect(() => {points = generateGrid(grid_style, radius_mm, radius_margin_mm, grid_spacing_mm); point_colors = {}; points_by_color = points_by_color_defaults;});

    function resetValues() {
        point_colors = {};
        points_by_color = points_by_color_defaults;
        points = {};
        grid_style = 'standard';
        current_color = 'Blue';
        radius_mm = 40;
        radius_margin_mm = 2;
        grid_spacing_mm = 4;
        points = generateGrid(grid_style, radius_mm, radius_margin_mm, grid_spacing_mm);
    }

    function roundPoint(p) {
        return Math.round(parseFloat(p) * 1000) / 1000;
    }
    
    function groupByColors() {
        // Convert object into an array
        const entries = Object.entries(point_colors);

        const blue_points = entries.filter(([, color]) => color === "Blue")
                                .map(([point, color]) => ({
                                    point: point.split(',').map(roundPoint), 
                                    color
                                }));

        const red_points = entries.filter(([, color]) => color === "Red")
                                .map(([point, color]) => ({
                                    point: point.split(',').map(roundPoint), 
                                    color
                                }));
        
        const yellow_points = entries.filter(([, color]) => color === "Yellow")
                                    .map(([point, color]) => ({
                                        point: point.split(',').map(roundPoint), 
                                        color
                                    }));

        const green_points = entries.filter(([, color]) => color === "Green")
                                    .map(([point, color]) => ({
                                        point: point.split(',').map(roundPoint), 
                                        color
                                    }));

        const cyan_points = entries.filter(([, color]) => color === "Cyan")
                                .map(([point, color]) => ({
                                    point: point.split(',').map(roundPoint), 
                                    color
                                }));

        return {blue_points, red_points, yellow_points, green_points, cyan_points};
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

    async function copyScriptToClipboard() {
        try {
            // Get the content to copy
            let content = scriptToCopy;
            // content = content.replace(/\s+/g, ' ');
            // content = content.replace(/(\w+_points = \[[^\]]*\])/g, '$1\n');

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


</script>

<article class="prose w-full mx-auto mt-5">
    <h2 class="text-center">Opentrons Art Interface</h2>
</article>

<div class="flex flex-row w-full max-w-[100vw] sm:max-w-[500px] mx-auto px-5">
    <div class="">
        {#if current_point.x != null && current_point.y != null}
            {roundPoint(current_point.x)}, {roundPoint(current_point.y)}
        {/if}
    </div>
    <label class="swap ml-auto">
        <input type="checkbox" bind:checked={show_outlines} />
        <svg class="swap-on w-8 h-8 text-neutral" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g data-name="Layer 2"> <g data-name="eye"> <rect width="24" height="24" opacity="0"></rect> <circle cx="12" cy="12" r="1.5"></circle> <path d="M21.87 11.5c-.64-1.11-4.16-6.68-10.14-6.5-5.53.14-8.73 5-9.6 6.5a1 1 0 0 0 0 1c.63 1.09 4 6.5 9.89 6.5h.25c5.53-.14 8.74-5 9.6-6.5a1 1 0 0 0 0-1zm-9.87 4a3.5 3.5 0 1 1 3.5-3.5 3.5 3.5 0 0 1-3.5 3.5z"></path> </g> </g> </g></svg>
        <svg class="swap-off w-8 h-8 text-neutral" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g data-name="Layer 2"> <g data-name="eye-off"> <rect width="24" height="24" opacity="0"></rect> <circle cx="12" cy="12" r="1.5"></circle> <path d="M15.29 18.12L14 16.78l-.07-.07-1.27-1.27a4.07 4.07 0 0 1-.61.06A3.5 3.5 0 0 1 8.5 12a4.07 4.07 0 0 1 .06-.61l-2-2L5 7.87a15.89 15.89 0 0 0-2.87 3.63 1 1 0 0 0 0 1c.63 1.09 4 6.5 9.89 6.5h.25a9.48 9.48 0 0 0 3.23-.67z"></path> <path d="M8.59 5.76l2.8 2.8A4.07 4.07 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 4.07 4.07 0 0 1-.06.61l2.68 2.68.84.84a15.89 15.89 0 0 0 2.91-3.63 1 1 0 0 0 0-1c-.64-1.11-4.16-6.68-10.14-6.5a9.48 9.48 0 0 0-3.23.67z"></path> <path d="M20.71 19.29L19.41 18l-2-2-9.52-9.53L6.42 5 4.71 3.29a1 1 0 0 0-1.42 1.42L5.53 7l1.75 1.7 7.31 7.3.07.07L16 17.41l.59.59 2.7 2.71a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42z"></path> </g> </g> </g></svg>
    </label>
</div>

<div class="relative border border-neutral rounded-full mx-auto w-full max-w-[94vw] max-h-[94vw] sm:max-w-[500px] sm:max-h-[500px] aspect-square mb-6" style="width: {(radius_mm + radius_margin_mm) * 16}px; height: {(radius_mm + radius_margin_mm) * 16}px;">
    {#each points as { x, y }}
    <!-- TODO: figure out if w-4 h-4 is a reasonable estimate -->
        <input type="checkbox" id="dot-{x}-{y}" 
            class="checkbox w-4 h-4 absolute rounded-full [--chkfg:invisible] transition-[box-shadow] duration-300 ease-in-out {point_colors[`${x}, ${y}`] ? 'border-0' : ''} {show_outlines ? '' : 'border-0'}"
            style=" 
                left: calc(50% + ({x / radius_mm} * 50%) - 8px); 
                top: calc(50% - ({y / radius_mm} * 50%) - 8px);
                background-color: {well_colors[point_colors[`${x}, ${y}`]] || 'transparent'};
                box-shadow: {point_colors[`${x}, ${y}`] ? `0 0 7px 3px ${well_colors[point_colors[`${x}, ${y}`]]}` : 'none'}
                "
            onmouseover={() => current_point = { x, y }}
            onfocus={() => current_point = { x, y }}
            onmouseout={() => current_point = {}}
            onblur={() => current_point = {}}
            onclick={() => {
                if (point_colors[`${x}, ${y}`] === current_color) {
                    delete point_colors[`${x}, ${y}`];
                    current_point = {};
                } else {
                    point_colors[`${x}, ${y}`] = current_color;
                }
                points_by_color = groupByColors();
            }}
            />
    {/each}
</div>

<div class="flex flex-col px-5 gap-4 w-full max-w-[100vw] sm:max-w-[500px] mx-auto mb-[150px]">
    <div class="flex flex-row w-full gap-6">
        <!-- GRID TYPE -->
        <div class="flex flex-col w-[50%] gap-2 mx-auto">
            <div class="flex flex-row justify-between">
                <span class="font-semibold">Grid</span> <span class="opacity-70">{grid_style.charAt(0).toUpperCase() + grid_style.slice(1)}</span>
            </div>
            <div class="flex flex-row justify-between">
                <button class="btn btn-sm group {grid_style === 'standard' ? 'btn-neutral' : 'btn-outline'}" type="button" onclick={grid_style = "standard"} aria-label="standard">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="miter"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line x1="5.99" y1="6" x2="6" y2="6" stroke-linecap="round" stroke-width="2"></line><line x1="11.99" y1="6" x2="12" y2="6" stroke-linecap="round" stroke-width="2"></line><line x1="17.99" y1="6" x2="18" y2="6" stroke-linecap="round" stroke-width="2"></line><line x1="5.99" y1="12" x2="6" y2="12" stroke-linecap="round" stroke-width="2"></line><line x1="11.99" y1="12" x2="12" y2="12" stroke-linecap="round" stroke-width="2"></line><line x1="17.99" y1="12" x2="18" y2="12" stroke-linecap="round" stroke-width="2"></line><line x1="5.99" y1="18" x2="6" y2="18" stroke-linecap="round" stroke-width="2"></line><line x1="11.99" y1="18" x2="12" y2="18" stroke-linecap="round" stroke-width="2"></line><line x1="17.99" y1="18" x2="18" y2="18" stroke-linecap="round" stroke-width="2"></line></g></svg>
                </button>
                <button class="btn btn-sm group {grid_style === 'radial' ? 'btn-neutral' : 'btn-outline '}" type="button" onclick={grid_style = "radial"} aria-label="radial">
                    <svg class="w-5 h-5" viewBox="0 0 48 48" id="a" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.f{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;}</style></defs><circle id="b" class="f" cx="24" cy="24" r="8.5"></circle><circle id="c" class="f" cx="24" cy="24" r="11.8"></circle><circle id="d" class="f" cx="24" cy="24" r="18.25"></circle><circle id="e" class="f" cx="24" cy="24" r="21.5"></circle></g></svg>
                </button>
                <button class="btn btn-sm group {grid_style === 'honeycomb' ? 'btn-neutral' : 'btn-outline'}" type="button" onclick={grid_style = "honeycomb"} aria-label="honeycomb">
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
                <input type="radio" class="radio checked:bg-blue-400" value="Blue" bind:group={current_color} />
                <input type="radio" class="radio checked:bg-red-400" value="Red" bind:group={current_color} />
                <input type="radio" class="radio checked:bg-yellow-400" value="Yellow" bind:group={current_color} />
                <input type="radio" class="radio checked:bg-green-400" value="Green" bind:group={current_color} />
                <input type="radio" class="radio checked:bg-cyan-400" value="Cyan" bind:group={current_color} />
            </div>
        </div>
    </div>

    <div class="flex flex-row w-full gap-6">
        <!-- GRID SPACING -->
        <div class="flex flex-col w-full gap-2 mx-auto">
            <div class="flex flex-row justify-between">
                <span class="font-semibold">Grid Spacing</span><span class="opacity-70">{grid_spacing_mm}mm</span>
            </div>
            <input type="range" min="1" max="15" class="range" step="0.1" bind:value={grid_spacing_mm} />
        </div>
        <!-- GRID MARGIN -->
        <div class="flex flex-col w-full gap-2 mx-auto">
            <div class="flex flex-row justify-between">
                <span class="font-semibold">Margin</span><span class="opacity-70">{radius_margin_mm}mm</span>
            </div>
            <input type="range" min="1" max="15" class="range" step="0.1" bind:value={radius_margin_mm} />
        </div>
    </div>

    <!-- SHOW POINTS -->
    <div class="flex flex-col w-full gap-2 mx-auto pb-2 bg-neutral-100 rounded px-2">
        <div class="flex flex-row justify-between pt-2 items-center">
            <span class="font-semibold">Points</span>
            <button class="btn btn-sm px-1 tooltip tooltip-left" aria-label="Copy Points" data-tip="Copy To Clipboard" onclick={copyPointsToClipboard}>
                <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M10 8V7C10 6.05719 10 5.58579 10.2929 5.29289C10.5858 5 11.0572 5 12 5H17C17.9428 5 18.4142 5 18.7071 5.29289C19 5.58579 19 6.05719 19 7V12C19 12.9428 19 13.4142 18.7071 13.7071C18.4142 14 17.9428 14 17 14H16M7 19H12C12.9428 19 13.4142 19 13.7071 18.7071C14 18.4142 14 17.9428 14 17V12C14 11.0572 14 10.5858 13.7071 10.2929C13.4142 10 12.9428 10 12 10H7C6.05719 10 5.58579 10 5.29289 10.2929C5 10.5858 5 11.0572 5 12V17C5 17.9428 5 18.4142 5.29289 18.7071C5.58579 19 6.05719 19 7 19Z" stroke="#464455" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
            </button>
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

    <!-- RESET BUTTON -->
    <button class="btn btn-neutral btn-sm ml-auto" onclick={resetValues}>
        <svg class="w-5 h-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="none" fill-rule="evenodd" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" transform="translate(2 2)"> <path d="m4.5 1.5c-2.4138473 1.37729434-4 4.02194088-4 7 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8"></path> <path d="m4.5 5.5v-4h-4"></path> </g> </g></svg>
        Reset All
    </button>

    <!-- ABOUT SECTION -->
    <div class="collapse collapse-arrow pt-4">
        <input type="checkbox" id="section1" class="toggle-checkbox" />
        <label for="section1" class="collapse-title text-lg font-medium">What is Opentrons Art Interface?</label>
        <div class="collapse-content text-sm">
            <p>This website is made for the Opentrons recitation of <a class="italic underline" href="https://howtogrowalmostanything.notion.site/HTGAA-2024-63a45d6c8f934456b70e30eee86f9b78">'How To Grow (Almost) Anything'</a> (HTGAA), to teach bio-enthusiasts of all backgrounds the principles and skills at the cutting edge of bioengineering and synthetic biology.</p>
        </div>
    </div>
    <div class="collapse collapse-arrow">
        <input type="checkbox" id="section1" class="toggle-checkbox" />
        <label for="section1" class="collapse-title text-lg font-medium">How To Use The Data Points</label>
        <div class="collapse-content">
            <p class="text-left text-sm">You'll want to write a script that iterates over each coordinate and dispenses the correct color of bacteria into that location. <span class="font-semibold">Try it yourself before you continue reading!</span></p>
            <span class="text-center text-sm opacity-60">Note: this will need to be combined with the code from class</span>
            <div class="flex flex-col w-full gap-2 mx-auto pb-2 bg-neutral-100 rounded px-2 mt-2">
                <div class="flex flex-row justify-between pt-2 items-center">
                    <span class="font-semibold">Python Script</span>
                    <button class="btn btn-sm px-1 tooltip tooltip-left" aria-label="Copy Points" data-tip="Copy To Clipboard" onclick={copyScriptToClipboard}>
                        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M10 8V7C10 6.05719 10 5.58579 10.2929 5.29289C10.5858 5 11.0572 5 12 5H17C17.9428 5 18.4142 5 18.7071 5.29289C19 5.58579 19 6.05719 19 7V12C19 12.9428 19 13.4142 18.7071 13.7071C18.4142 14 17.9428 14 17 14H16M7 19H12C12.9428 19 13.4142 19 13.7071 18.7071C14 18.4142 14 17.9428 14 17V12C14 11.0572 14 10.5858 13.7071 10.2929C13.4142 10 12.9428 10 12 10H7C6.05719 10 5.58579 10 5.29289 10.2929C5 10.5858 5 11.0572 5 12V17C5 17.9428 5 18.4142 5.29289 18.7071C5.58579 19 6.05719 19 7 19Z" stroke="#464455" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
                    </button>
                </div>
                <div class="text-xs whitespace-pre-wrap overflow-auto break-words max-w-full">
                    {scriptToCopy}
                </div>
            </div>
        </div>
    </div>
    <div class="collapse collapse-arrow">
        <input type="checkbox" id="section2" class="toggle-checkbox" />
        <label for="section2" class="collapse-title text-lg font-medium">Code & License</label>
        <div class="collapse-content text-sm">
            <p>This project is <a class="underline" href="https://github.com/RonanChance/opentrons-art-gui/blob/main/LICENSE">MIT Licensed</a> and I would love your help in adding new features!</p>
            <div class="max-w-[200px] mx-auto pt-4">
                <a href="https://github.com/RonanChance/opentrons-art-gui" target="_blank" data-value="github" style="border-radius:4px;" class="py-2 px-1 flex justify-center items-center bg-neutral hover:bg-gray-900 text-white transition ease-in duration-100 text-center text-sm font-semibold shadow-md focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="mr-2" viewBox="0 0 1792 1792">
                    <path d="M896 128q209 0 385.5 103t279.5 279.5 103 385.5q0 251-146.5 451.5t-378.5 277.5q-27 5-40-7t-13-30q0-3 .5-76.5t.5-134.5q0-97-52-142 57-6 102.5-18t94-39 81-66.5 53-105 20.5-150.5q0-119-79-206 37-91-8-204-28-9-81 11t-92 44l-38 24q-93-26-192-26t-192 26q-16-11-42.5-27t-83.5-38.5-85-13.5q-45 113-8 204-79 87-79 206 0 85 20.5 150t52.5 105 80.5 67 94 39 102.5 18q-39 36-49 103-21 10-45 15t-57 5-65.5-21.5-55.5-62.5q-19-32-48.5-52t-49.5-24l-20-3q-21 0-29 4.5t-5 11.5 9 14 13 12l7 5q22 10 43.5 38t31.5 51l10 23q13 38 44 61.5t67 30 69.5 7 55.5-3.5l23-4q0 38 .5 88.5t.5 54.5q0 18-13 30t-40 7q-232-77-378.5-277.5t-146.5-451.5q0-209 103-385.5t279.5-279.5 385.5-103zm-477 1103q3-7-7-12-10-3-13 2-3 7 7 12 9 6 13-2zm31 34q7-5-2-16-10-9-16-3-7 5 2 16 10 10 16 3zm30 45q9-7 0-19-8-13-17-6-9 5 0 18t17 7zm42 42q8-8-4-19-12-12-20-3-9 8 4 19 12 12 20 3zm57 25q3-11-13-16-15-4-19 7t13 15q15 6 19-6zm63 5q0-13-17-11-16 0-16 11 0 13 17 11 16 0 16-11zm58-10q-2-11-18-9-16 3-14 15t18 8 14-14z"></path>
                    </svg>
                    View on GitHub
                </a>
            </div>
        </div>
    </div>
</div>