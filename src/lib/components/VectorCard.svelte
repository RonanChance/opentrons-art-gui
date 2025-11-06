<script>
    export let backbone_vector;
    export let selected_backbone_vector;
</script> 

<div class="card w-full card-xs shadow-sm {backbone_vector.name === selected_backbone_vector.name ? 'bg-neutral text-white' : 'bg-base-100' }">
    <div class="flex flex-col px-5 py-5 gap-4 h-[200px]">
        <p class="text-md font-bold">{backbone_vector.name}</p>
        <p class="text-[10px] overflow-scroll">{backbone_vector.description}</p>
        <div class="flex w-full text-xs ml-auto justify-between {backbone_vector.name === selected_backbone_vector.name ? 'text-green-300 font-semibold' : 'italic' }">
            {#if backbone_vector.name === selected_backbone_vector.name} 
                <div class="">Selected</div>
            {:else}
                <div class=""></div>
            {/if}
            <a href="https://www.twistbioscience.com/products/genes/vectors?tab=catalog-vectors" target="_blank" class="underline" referrerpolicy="no-referrer" aria-label="View catalog vectors on Twist Bioscience">
                <svg class="inline w-4 h-4" width="211px" height="211px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21 9.00001L21 3.00001M21 3.00001H15M21 3.00001L12 12M10 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V14" stroke="{backbone_vector.name === selected_backbone_vector.name ? '#fff' : '#000' }" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
            </a>
        </div>
    </div>
</div>