<script>
	export let options = {};
    export let title = "";
	export let selected = options ? Object.keys(options)[0] : null;
	export let width = "w-64";
	export let selectClass = "select select-sm select-bordered";

	const scrollDelay = 150; // ms
	const lastScrollMap = new WeakMap(); // track last scroll per element

	function handleWheel(e) {
		e.preventDefault();

		const el = e.currentTarget;
		const now = Date.now();
		const lastScroll = lastScrollMap.get(el) || 0;

		if (now - lastScroll < scrollDelay) return;
		lastScrollMap.set(el, now);

		const dir = e.deltaY > 0 ? 1 : -1;
		let i = el.selectedIndex + dir;

		if (i < 0) i = el.options.length - 1;
		else if (i >= el.options.length) i = 0;

		el.selectedIndex = i;
		selected = el.value;
		el.dispatchEvent(new Event("change", { bubbles: true }));
	}
</script>

<div class="flex flex-col w-full gap-2">
    {#if title}
        <h3 class="text-center underline text-neutral">{title}</h3>
    {/if}
    <div class="flex flex-row w-full justify-center">
        <div class={width}>
            <select
                class={selectClass + " w-full"}
                bind:value={selected}
                on:wheel={handleWheel}
            >
                {#each Object.entries(options) as [key, info]}
                    <option value={key} title={info.description}>{info.part_name}</option>
                {/each}
            </select>
        </div>
    </div>
    {#if selected}
        <p class={"text-xs opacity-80 mx-auto my-auto"}>
            {options[selected].short_desc}
            {#if title !== "Start Codon" && title !== "Stop Codon"}
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <a href={"https://parts.igem.org/Part:" + options[selected].part_name} target="_blank" class="text-xs underline mx-auto mt-1">
                    <svg class="inline w-4 h-4" width="211px" height="211px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21 9.00001L21 3.00001M21 3.00001H15M21 3.00001L12 12M10 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V14" stroke="#000000" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                </a>
            {/if}
        </p>
        <div class="px-2 overflow-y-hidden scrollbar-hide scrollbar-none text-xs opacity-80 whitespace-nowrap mx-auto w-[45%] h-7 bg-gray-100 rounded-sm flex items-center justify-start">
            {options[selected].sequence}
        </div>
    {/if}
</div>

<style>
    .scrollbar-none::-webkit-scrollbar {
        display: none;
    }

    .scrollbar-none {
        scrollbar-width: none; /* Firefox */
    }
</style>