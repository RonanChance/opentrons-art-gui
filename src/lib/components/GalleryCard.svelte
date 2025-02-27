
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
    <!-- VERIFICATION MARK + INFO BUTTON -->
    {#if record.verified}
        <div class="absolute left-2 top-2 touch-manipulation tooltip tooltip-right" data-tip="Verified by admin" aria-label="info-button">
            <svg class="w-4 h-4 opacity-65" viewBox="0 0 24 24" fill="#1DA1F2" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.78133 3.89027C10.3452 3.40974 10.6271 3.16948 10.9219 3.02859C11.6037 2.70271 12.3963 2.70271 13.0781 3.02859C13.3729 3.16948 13.6548 3.40974 14.2187 3.89027C14.4431 4.08152 14.5553 4.17715 14.6752 4.25747C14.9499 4.4416 15.2584 4.56939 15.5828 4.63344C15.7244 4.66139 15.8713 4.67312 16.1653 4.69657C16.9038 4.7555 17.273 4.78497 17.5811 4.89378C18.2936 5.14546 18.8541 5.70591 19.1058 6.41844C19.2146 6.72651 19.244 7.09576 19.303 7.83426C19.3264 8.12819 19.3381 8.27515 19.3661 8.41669C19.4301 8.74114 19.5579 9.04965 19.7421 9.32437C19.8224 9.44421 19.918 9.55642 20.1093 9.78084C20.5898 10.3447 20.8301 10.6267 20.971 10.9214C21.2968 11.6032 21.2968 12.3958 20.971 13.0776C20.8301 13.3724 20.5898 13.6543 20.1093 14.2182C19.918 14.4426 19.8224 14.5548 19.7421 14.6747C19.5579 14.9494 19.4301 15.2579 19.3661 15.5824C19.3381 15.7239 19.3264 15.8709 19.303 16.1648C19.244 16.9033 19.2146 17.2725 19.1058 17.5806C18.8541 18.2931 18.2936 18.8536 17.5811 19.1053C17.273 19.2141 16.9038 19.2435 16.1653 19.3025C15.8713 19.3259 15.7244 19.3377 15.5828 19.3656C15.2584 19.4297 14.9499 19.5574 14.6752 19.7416C14.5553 19.8219 14.4431 19.9175 14.2187 20.1088C13.6548 20.5893 13.3729 20.8296 13.0781 20.9705C12.3963 21.2963 11.6037 21.2963 10.9219 20.9705C10.6271 20.8296 10.3452 20.5893 9.78133 20.1088C9.55691 19.9175 9.44469 19.8219 9.32485 19.7416C9.05014 19.5574 8.74163 19.4297 8.41718 19.3656C8.27564 19.3377 8.12868 19.3259 7.83475 19.3025C7.09625 19.2435 6.72699 19.2141 6.41893 19.1053C5.7064 18.8536 5.14594 18.2931 4.89427 17.5806C4.78546 17.2725 4.75599 16.9033 4.69706 16.1648C4.6736 15.8709 4.66188 15.7239 4.63393 15.5824C4.56988 15.2579 4.44209 14.9494 4.25796 14.6747C4.17764 14.5548 4.08201 14.4426 3.89076 14.2182C3.41023 13.6543 3.16997 13.3724 3.02907 13.0776C2.7032 12.3958 2.7032 11.6032 3.02907 10.9214C3.16997 10.6266 3.41023 10.3447 3.89076 9.78084C4.08201 9.55642 4.17764 9.44421 4.25796 9.32437C4.44209 9.04965 4.56988 8.74114 4.63393 8.41669C4.66188 8.27515 4.6736 8.12819 4.69706 7.83426C4.75599 7.09576 4.78546 6.72651 4.89427 6.41844C5.14594 5.70591 5.7064 5.14546 6.41893 4.89378C6.72699 4.78497 7.09625 4.7555 7.83475 4.69657C8.12868 4.67312 8.27564 4.66139 8.41718 4.63344C8.74163 4.56939 9.05014 4.4416 9.32485 4.25747C9.4447 4.17715 9.55691 4.08152 9.78133 3.89027Z" stroke="#1DA1F2" stroke-width="1.5"></path> <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
        </div>
    {/if}
    <button class="absolute right-2 top-2 opacity-50 touch-manipulation" aria-label="info-button" onclick={() => {flipped = !flipped}}>
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
    </button>

    <!-- FRONT OF CARD -->
    <div class="flex flex-col justify-between min-w-[150px] max-w-[150px] min-h-[295px] max-h-[295px] touch-manipulation">
        {#if !flipped}
            <div class="relative border border-neutral/70 rounded-full mx-auto max-w-[150px] max-h-[150px] aspect-square bg-white"
                style="width: {(record.radius_mm + record.radius_margin_mm) * 16}px; height: {(record.radius_mm + record.radius_margin_mm) * 16}px;">
                {#each Object.entries(record.point_colors) as [ key, color ]}
                    <input type="checkbox" id="dot-{key.split(", ")[0]}-{key.split(", ")[1]}-{i}"
                        class="checkbox 
                        {record.point_size === 0 ? 'w-[8px] h-[8px]' : ''}
                        {record.point_size === 1 ? 'w-[2px] h-[2px]' : ''}
                        {record.point_size === 1.5 ? 'w-[3px] h-[3px]' : ''}
                        {record.point_size === 2 ? 'w-[4px] h-[4px]' : ''} 
                        {record.point_size === 2.5 ? 'w-[5px] h-[5px]' : ''} 
                        {record.point_size === 3 ? 'w-[6px] h-[6px]' : ''} 
                        {record.point_size === 3.5 ? 'w-[7px] h-[7px]' : ''}
                        {record.point_size === 4 ? 'w-[8px] h-[8px]' : ''}
                        {record.point_size === 4.5 ? 'w-[9px] h-[9px]' : ''}
                        {record.point_size === 5 ? 'w-[10px] h-[10px]' : ''}
                        absolute rounded-full [--chkfg:invisible] transition-[box-shadow] duration-300 ease-in-out border-0"
                        style="left: calc(50% + ({key.split(", ")[0] / record.radius_mm} * 50%) - 4px); top: calc(50% - ({key.split(", ")[1] / record.radius_mm} * 50%) - 4px); background-color: {well_colors[color] || 'transparent'};"
                        draggable="false"/>
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
                    <div class="tooltip tooltip-right" data-tip="Point Size">
                        <svg class="w-4 h-4" fill="#000000" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 56c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m0-48C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 168c-44.183 0-80 35.817-80 80s35.817 80 80 80 80-35.817 80-80-35.817-80-80-80z"></path></g></svg>
                    </div>
                    <div class="inline-flex items-baseline gap-0.5">
                        <span class="text-base">{record.point_size || 4}</span>
                        <span class="text-sm">µL</span>
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
            <a href="./?id={record.id}" target="_blank" rel="noreferrer noopener" class="flex w-full btn btn-sm rounded bg-neutral text-white hover:bg-neutral-200 hover:text-neutral mx-auto gap-1 mt-2 items-center">
                <svg class="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10.7071 10.7071C10.3166 11.0976 9.68342 11.0976 9.29289 10.7071C8.90237 10.3166 8.90237 9.68342 9.29289 9.29289L15.2929 3.29289C15.6834 2.90237 16.3166 2.90237 16.7071 3.29289C17.0976 3.68342 17.0976 4.31658 16.7071 4.70711L10.7071 10.7071Z" fill="currentColor"></path> <path d="M15 15V11.5C15 10.9477 15.4477 10.5 16 10.5C16.5523 10.5 17 10.9477 17 11.5V16C17 16.5523 16.5523 17 16 17H4C3.44772 17 3 16.5523 3 16V4C3 3.44772 3.44772 3 4 3H8.5C9.05228 3 9.5 3.44772 9.5 4C9.5 4.55228 9.05228 5 8.5 5H5V15H15Z" fill="currentColor"></path> <path d="M17 8C17 8.55228 16.5523 9 16 9C15.4477 9 15 8.55228 15 8V4C15 3.44772 15.4477 3 16 3C16.5523 3 17 3.44772 17 4V8Z" fill="currentColor"></path> <path d="M12 5C11.4477 5 11 4.55228 11 4C11 3.44772 11.4477 3 12 3H16C16.5523 3 17 3.44772 17 4C17 4.55228 16.5523 5 16 5H12Z" fill="currentColor"></path> </g></svg>
                View
            </a>
        <!-- BACK OF CARD -->
        {:else}
            <div class="text-wrap overflow-auto max-h-[220px] truncate font-medium w-full mt-3">
                {#if record.title} {record.title} {:else} Untitled {/if}
            </div>
            <div class="flex flex-col mt-3 gap-1">
                <div class="text-xs flex flex-row gap-1 items-center mx-auto max-w-full">
                    <svg class="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="#000000"></path> <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#000000"></path> </g></svg>
                    {#if record.author}
                        <span class="overflow-hidden whitespace-nowrap text-ellipsis"> {record.author} </span>
                    {:else}
                        Anonymous
                    {/if}
                </div>
                <div class="text-wrap overflow-auto max-h-[150px] text-xs text-center bg-neutral-200 rounded-lg">
                    {formatLocalTime(record.created)}
                </div>
            </div>
        {/if}
    </div>
</div>