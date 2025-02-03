
<script>
    export let record;
    export let i;
    export let well_colors;
    let flipped = false;

    function formatLocalTime(utcString) {
        const date = new Date(utcString);
        return date.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ' -');
    }

</script>

<div class="card shadow-xl px-3 py-3 outline outline-1 outline-neutral/10 max-w-[175px] ">
    {#if record.verified}
        <div class="absolute left-2 top-2 touch-manipulation tooltip tooltip-right" data-tip="Verified by admin" aria-label="info-button">
            <svg class="w-4 h-4 opacity-50 " viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 12L11 14L15.5 9.5M7.33377 3.8187C8.1376 3.75455 8.90071 3.43846 9.51447 2.91542C10.9467 1.69486 13.0533 1.69486 14.4855 2.91542C15.0993 3.43846 15.8624 3.75455 16.6662 3.8187C18.5421 3.96839 20.0316 5.45794 20.1813 7.33377C20.2455 8.1376 20.5615 8.90071 21.0846 9.51447C22.3051 10.9467 22.3051 13.0533 21.0846 14.4855C20.5615 15.0993 20.2455 15.8624 20.1813 16.6662C20.0316 18.5421 18.5421 20.0316 16.6662 20.1813C15.8624 20.2455 15.0993 20.5615 14.4855 21.0846C13.0533 22.3051 10.9467 22.3051 9.51447 21.0846C8.90071 20.5615 8.1376 20.2455 7.33377 20.1813C5.45794 20.0316 3.96839 18.5421 3.8187 16.6662C3.75455 15.8624 3.43846 15.0993 2.91542 14.4855C1.69486 13.0533 1.69486 10.9467 2.91542 9.51447C3.43846 8.90071 3.75455 8.1376 3.8187 7.33377C3.96839 5.45794 5.45794 3.96839 7.33377 3.8187Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
        </div>
    {/if}
    <button class="absolute right-2 top-2 opacity-50 touch-manipulation" aria-label="info-button" onclick={() => {flipped = !flipped}}>
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
    </button>
    {#if !flipped}
        <div class="relative border border-neutral/70 rounded-full mx-auto max-w-[150px] max-h-[150px] aspect-square bg-white"
        style="width: {(record.radius_mm + record.radius_margin_mm) * 16}px; height: {(record.radius_mm + record.radius_margin_mm) * 16}px;">
            {#each Object.entries(record.point_colors) as [ key, color ]}
                <input type="checkbox" id="dot-{key.split(", ")[0]}-{key.split(", ")[1]}-{i}"
                    class="checkbox w-2 h-2 absolute rounded-full [--chkfg:invisible] transition-[box-shadow] duration-300 ease-in-out border-0"
                    style=" 
                        left: calc(50% + ({key.split(", ")[0] / record.radius_mm} * 50%) - 4px); 
                        top: calc(50% - ({key.split(", ")[1] / record.radius_mm} * 50%) - 4px);
                        background-color: {well_colors[color] || 'transparent'};
                        "
                    draggable="false"
                />
            {/each}
        </div>
        <div class="flex flex-col pt-2">
            <div class="flex flex-row items-center gap-1">
                <div class="tooltip tooltip-right" data-tip="Grid Style">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 7C4 5.34315 5.34315 4 7 4C8.65685 4 10 5.34315 10 7C10 8.65685 8.65685 10 7 10C5.34315 10 4 8.65685 4 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 7C14 5.34315 15.3431 4 17 4C18.6569 4 20 5.34315 20 7C20 8.65685 18.6569 10 17 10C15.3431 10 14 8.65685 14 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 17C14 15.3431 15.3431 14 17 14C18.6569 14 20 15.3431 20 17C20 18.6569 18.6569 20 17 20C15.3431 20 14 18.6569 14 17Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4 17C4 15.3431 5.34315 14 7 14C8.65685 14 10 15.3431 10 17C10 18.6569 8.65685 20 7 20C5.34315 20 4 18.6569 4 17Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                </div>
                <div class="inline-flex items-baseline gap-0.5">
                    <span class="text-base">{record.grid_style}</span>
                </div>
            </div>
            <div class="flex flex-row items-center gap-1">
                <div class="tooltip tooltip-right" data-tip="Grid Spacing">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6 12H18M6 12L8 9M6 12L8 15M18 12L16 9M18 12L16 15M21 21V3M3 21V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                </div>
                <div class="inline-flex items-baseline gap-0.5">
                    <span class="text-base">{record.grid_spacing_mm}</span>
                    <span class="text-sm">mm</span>
                </div>
            </div>
            <div class="flex flex-row items-center gap-1">
                <div class="tooltip inline tooltip-right" data-tip="# painted / # points">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8.99999 14C8.99999 13.4477 8.55227 13 7.99999 13C7.4477 13 6.99999 13.4477 6.99999 14C6.99999 15.3574 7.26721 16.7375 8.08236 17.7972C8.93437 18.9048 10.2571 19.5 12 19.5C12.5523 19.5 13 19.0523 13 18.5C13 17.9477 12.5523 17.5 12 17.5C10.7429 17.5 10.0656 17.0952 9.66761 16.5778C9.23276 16.0125 8.99999 15.1426 8.99999 14Z" fill="currentColor"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M13.4228 1.54267C12.6513 0.711988 11.348 0.712021 10.5766 1.54273C9.63287 2.55896 7.89116 4.5305 6.37916 6.77881C4.87045 9.02222 3.46953 11.5773 3.49416 14.3526C3.49633 14.5981 3.50939 14.9426 3.55218 15.3536C3.63717 16.17 3.84245 17.278 4.33361 18.4008C4.82693 19.5285 5.61868 20.6923 6.88173 21.5709C8.15052 22.4536 9.82552 23 11.9997 23C14.1739 23 15.8489 22.4536 17.1178 21.5709C18.3808 20.6923 19.1727 19.5286 19.6661 18.4009C20.1573 17.2781 20.3627 16.17 20.4477 15.3536C20.4905 14.9427 20.5036 14.5982 20.5058 14.3527C20.5306 11.5774 19.1293 9.02208 17.6206 6.77875C16.1084 4.53043 14.3666 2.55889 13.4228 1.54267ZM8.03877 7.89491C9.44577 5.80274 11.0797 3.94302 11.9997 2.94942C12.9198 3.94301 14.5539 5.80273 15.961 7.89491C17.2351 9.78932 18.5269 11.9805 18.5059 14.3348C18.5042 14.5268 18.4938 14.8074 18.4585 15.1464C18.3873 15.83 18.2176 16.722 17.8338 17.5992C17.4521 18.4715 16.8689 19.3078 15.9756 19.9291C15.0882 20.5465 13.8256 21 11.9997 21C10.1738 21 8.91129 20.5465 8.02387 19.9291C7.13071 19.3078 6.54754 18.4715 6.16596 17.5992C5.78221 16.722 5.61259 15.8301 5.54142 15.1465C5.50613 14.8074 5.49578 14.5269 5.49408 14.3349C5.4732 11.9806 6.76469 9.78944 8.03877 7.89491Z" fill="currentColor"></path> </g></svg>
                </div>
                <div class="inline-flex items-baseline gap-0">
                    <span class="text-base">{record.num_drops}</span><span class="text-[7pt]">/{record.num_total}</span> 
                </div>
            </div>
        </div>
        <a href="./?id={record.id}" target="_blank" rel="noreferrer noopener" class="flex w-full btn btn-sm rounded bg-neutral text-white hover:bg-neutral-200 hover:text-neutral mx-auto gap-1 mt-2">
            <svg class="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10.7071 10.7071C10.3166 11.0976 9.68342 11.0976 9.29289 10.7071C8.90237 10.3166 8.90237 9.68342 9.29289 9.29289L15.2929 3.29289C15.6834 2.90237 16.3166 2.90237 16.7071 3.29289C17.0976 3.68342 17.0976 4.31658 16.7071 4.70711L10.7071 10.7071Z" fill="currentColor"></path> <path d="M15 15V11.5C15 10.9477 15.4477 10.5 16 10.5C16.5523 10.5 17 10.9477 17 11.5V16C17 16.5523 16.5523 17 16 17H4C3.44772 17 3 16.5523 3 16V4C3 3.44772 3.44772 3 4 3H8.5C9.05228 3 9.5 3.44772 9.5 4C9.5 4.55228 9.05228 5 8.5 5H5V15H15Z" fill="currentColor"></path> <path d="M17 8C17 8.55228 16.5523 9 16 9C15.4477 9 15 8.55228 15 8V4C15 3.44772 15.4477 3 16 3C16.5523 3 17 3.44772 17 4V8Z" fill="currentColor"></path> <path d="M12 5C11.4477 5 11 4.55228 11 4C11 3.44772 11.4477 3 12 3H16C16.5523 3 17 3.44772 17 4C17 4.55228 16.5523 5 16 5H12Z" fill="currentColor"></path> </g></svg>
            View
        </a>
    {:else}
        <div class="flex flex-col justify-between min-w-[150px] max-w-[150px] min-h-[270px] max-h-[270px] touch-manipulation">
            <div class="text-wrap overflow-auto max-h-[220px] truncate font-medium w-full mt-3">
                {#if record.title}
                    {record.title}
                {:else}
                    Untitled
                {/if}
            </div>
            <!-- <div class="text-wrap overflow-auto max-h-[150px] text-xs mt-2">
                {record.description}
            </div> -->
            <div class="flex flex-col mt-3 gap-1">
                <div class="text-xs flex flex-row gap-1 items-center mx-auto max-w-full">
                    <svg class="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="#000000"></path> <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#000000"></path> </g></svg>
                    {#if record.author}
                        <span class="overflow-hidden whitespace-nowrap text-ellipsis">
                            {record.author}
                        </span>
                    {:else}
                        Anonymous
                    {/if}
                </div>
                <div class="text-wrap overflow-auto max-h-[150px] text-xs text-center bg-neutral-200 rounded-lg">
                    {formatLocalTime(record.created)}
                </div>
            </div>
            
        </div>
    {/if}
</div>