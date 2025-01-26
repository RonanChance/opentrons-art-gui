<script>
    import { generateGrid } from './generateGrid.js';
    let grid_style = $state('standard'); // 'standard' or 'honeycomb' or 'radial'
    let radius_mm = $state(40);
    let radius_margin_mm = $state(2);
    let grid_spacing_mm = $state(3);
    
    let points = $state({});
    let point_colors = $state({});

    let show_outlines = $state(true);
    let current_point = $state({});

    let current_color = $state('Blue');
    const well_colors = {
        'Red' : '#fca5a5', // red-300
        'Yellow' : '#fde047', // yellow-300
        'Green' : '#86efac', // green-300
        'Cyan' : '#67e8f9', // cyan-300
        'Blue' : '#93c5fd' // blue-300
    }
    
    $effect(() => {points = generateGrid(grid_style, radius_mm, radius_margin_mm, grid_spacing_mm); point_colors = {}});

    function resetValues() {
        grid_style = 'standard';
        radius_mm = 40;
        grid_spacing_mm = 3;
        radius_margin_mm = 2;
        points = {};
        point_colors = {};
        points = generateGrid(grid_style, radius_mm, radius_margin_mm, grid_spacing_mm);
    }

    function roundPoint(p) {
        return Math.round(parseFloat(p) * 1000) / 1000;
    }
</script>

<article class="prose w-full mx-auto mt-5">
    <h2 class="text-center">Opentrons GUI</h2>
</article>

<div class="flex flex-row w-full max-w-[100vw] sm:max-w-[500px] mx-auto px-5">
    <div class="">
        {#if current_point.x && current_point.y}
            {roundPoint(current_point.x)} {roundPoint(current_point.y)}
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
    <!-- hover:border-neutral hover:border-opacity-40 -->
        <input type="checkbox" id="dot-{x}-{y}" 
            class="checkbox w-4 h-4 absolute rounded-full [--chkfg:invisible] transition-[box-shadow] duration-300 ease-in-out {point_colors[`${x}, ${y}`] ? 'border-0' : ''} {show_outlines ? '' : 'border-0'}"
            style=" 
                left: calc(50% + ({x / radius_mm} * 50%) - 8px); 
                top: calc(50% - ({y / radius_mm} * 50%) - 8px);
                background-color: {well_colors[point_colors[`${x}, ${y}`]] || 'transparent'};
                box-shadow: {point_colors[`${x}, ${y}`] ? `0 0 12px 4px ${well_colors[point_colors[`${x}, ${y}`]]}` : 'none'}
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
            }}
            />
    {/each}
</div>

<div class="flex flex-col px-5 gap-4 w-full max-w-[100vw] sm:max-w-[500px] mx-auto">
    <!-- GRID SPACING -->
    <div class="flex flex-row w-full gap-6">
        <div class="flex flex-col w-full gap-2 mx-auto">
            <div class="flex flex-row justify-between">
                <span class="font-semibold">Grid Spacing</span> {grid_spacing_mm}mm
            </div>
            <input type="range" min="1" max="15" class="range" step="0.1" bind:value={grid_spacing_mm} />
        </div>
        <div class="flex flex-col w-full gap-2 mx-auto">
            <div class="flex flex-row justify-between">
                <span class="font-semibold">Margin</span> {radius_margin_mm}mm
            </div>
            <input type="range" min="1" max="15" class="range" step="0.1" bind:value={radius_margin_mm} />
        </div>
    </div>

    <!-- COLOR CHOICE -->
    <div class="flex flex-col w-full gap-4 mx-auto">
        <div class="flex flex-row justify-between">
            <span class="font-semibold">Bacteria Color</span> {current_color}
        </div>
        <div class="flex flex-row gap-4 mx-auto">
            <input type="radio" class="radio checked:bg-blue-400" checked="checked" value="Blue" bind:group={current_color} />
            <input type="radio" class="radio checked:bg-red-400" checked="checked" value="Red" bind:group={current_color} />
            <input type="radio" class="radio checked:bg-yellow-400" checked="checked" value="Yellow" bind:group={current_color} />
            <input type="radio" class="radio checked:bg-green-400" checked="checked" value="Green" bind:group={current_color} />
            <input type="radio" class="radio checked:bg-cyan-400" checked="checked" value="Cyan" bind:group={current_color} />
        </div>
    </div>

    <!-- GRID TYPE -->
    <div class="flex flex-col w-full gap-2 mx-auto">
        <div class="flex flex-row justify-between pb-2">
            <span class="font-semibold">Grid Type</span>
        </div>
        <button class="btn group {grid_style === 'standard' ? 'btn-neutral' : 'btn-outline'}" type="button" onclick={grid_style = "standard"}>
            <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="miter"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line x1="5.99" y1="6" x2="6" y2="6" stroke-linecap="round" stroke-width="2"></line><line x1="11.99" y1="6" x2="12" y2="6" stroke-linecap="round" stroke-width="2"></line><line x1="17.99" y1="6" x2="18" y2="6" stroke-linecap="round" stroke-width="2"></line><line x1="5.99" y1="12" x2="6" y2="12" stroke-linecap="round" stroke-width="2"></line><line x1="11.99" y1="12" x2="12" y2="12" stroke-linecap="round" stroke-width="2"></line><line x1="17.99" y1="12" x2="18" y2="12" stroke-linecap="round" stroke-width="2"></line><line x1="5.99" y1="18" x2="6" y2="18" stroke-linecap="round" stroke-width="2"></line><line x1="11.99" y1="18" x2="12" y2="18" stroke-linecap="round" stroke-width="2"></line><line x1="17.99" y1="18" x2="18" y2="18" stroke-linecap="round" stroke-width="2"></line></g></svg>
            Standard
        </button>
        <button class="btn group {grid_style === 'honeycomb' ? 'btn-neutral' : 'btn-outline'}" type="button" onclick={grid_style = "honeycomb"}>
            <svg class="w-5 h-5" fill="currentColor" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M508.203,197.698L435.2,149.03V59.731c0-2.995-1.579-5.769-4.139-7.313l-85.333-51.2c-2.705-1.621-6.084-1.621-8.789,0 L256,49.781L175.061,1.218c-2.705-1.621-6.084-1.621-8.789,0l-85.333,51.2c-2.56,1.544-4.139,4.318-4.139,7.313v89.3L3.797,197.7 C1.425,199.287,0,201.949,0,204.8v102.4c0,2.859,1.425,5.521,3.797,7.1L76.8,362.968v89.297c0,2.995,1.579,5.777,4.139,7.322 l85.333,51.2c1.357,0.811,2.876,1.212,4.395,1.212s3.038-0.401,4.395-1.212L256,462.223l80.939,48.563 c1.357,0.811,2.876,1.212,4.395,1.212c1.519,0,3.038-0.401,4.395-1.212l85.333-51.2c2.56-1.545,4.139-4.326,4.139-7.322v-89.298 l73.003-48.668c2.372-1.579,3.797-4.241,3.797-7.1v-102.4C512,201.948,510.575,199.285,508.203,197.698z M256,348.448 l-62.352-37.411l-14.448-8.669v-92.732l0.42-0.252L256,163.556l76.38,45.828l0.42,0.252v92.732l-14.448,8.669L256,348.448z M341.333,18.481l76.8,46.089v84.198l-76.8,46.08l-76.8-46.08V64.57L341.333,18.481z M93.867,64.57l76.8-46.089l76.8,46.089 v84.198l-76.8,46.08l-76.8-46.08V64.57z M17.067,209.365l68.502-45.668l57.07,34.242l19.495,11.699v92.73l-74.422,44.653 l-2.139,1.283l-68.506-45.67V209.365z M170.667,493.515l-76.8-46.08v-84.197l76.801-46.081l76.799,46.079v84.198L170.667,493.515z M341.333,493.515l-76.8-46.08v-84.198l76.8-46.08l76.8,46.08v84.198L341.333,493.515z M494.933,302.633l-68.506,45.67 l-76.066-45.638l-0.495-0.297v-92.732l76.561-45.935l68.506,45.67V302.633z"></path> </g> </g> </g></svg>
            Honeycomb
        </button>
        <button class="btn group {grid_style === 'radial' ? 'btn-neutral' : 'btn-outline '}" type="button" onclick={grid_style = "radial"}>
            <svg class="w-5 h-5" viewBox="0 0 48 48" id="a" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.f{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;}</style></defs><circle id="b" class="f" cx="24" cy="24" r="8.5"></circle><circle id="c" class="f" cx="24" cy="24" r="11.8"></circle><circle id="d" class="f" cx="24" cy="24" r="18.25"></circle><circle id="e" class="f" cx="24" cy="24" r="21.5"></circle></g></svg>
            Radial
        </button>
    </div>

    <!-- RESET POINTS -->
    <div class="flex flex-row w-full justify-between mx-auto mb-10">
        <button class="btn btn-error" onclick={resetValues}>Reset</button>
        <button class="btn">Save</button>
    </div>
</div>