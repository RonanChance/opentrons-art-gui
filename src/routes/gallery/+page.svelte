<script>
    import GalleryCard from '$lib/components/GalleryCard.svelte';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { well_colors } from '$lib/constants.js';

    const filter_list = ['Approved', 'Media Lab', 'Off']
    let filter = $state(0);
    let record_load_iteration = $state(0);
    let loadingRecords = $state(true);
    let loadedRecords = $state([]);

    onMount(async () => {
        if (browser) {
            loadGallery();
        }
    });

    async function loadGallery() {
        loadingRecords = true;
        const response = await fetch('../loadGallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ record_load_iteration, filter })
        });
        const r = await response.json();
        loadedRecords = [...loadedRecords, ...r.records];
        record_load_iteration += 1;
        loadingRecords = false;
    }
</script>

<article class="prose w-full mx-auto mt-5">
    <h2 class="text-center">Opentrons Art Gallery</h2>
</article>

<div class="flex flex-row w-full max-w-[100vw] sm:max-w-[500px] mx-auto px-5 pt-4 opacity-70">
    <a class="flex flex-row gap-1 items-center" href="/">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M11.7071 4.29289C12.0976 4.68342 12.0976 5.31658 11.7071 5.70711L6.41421 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H6.41421L11.7071 18.2929C12.0976 18.6834 12.0976 19.3166 11.7071 19.7071C11.3166 20.0976 10.6834 20.0976 10.2929 19.7071L3.29289 12.7071C3.10536 12.5196 3 12.2652 3 12C3 11.7348 3.10536 11.4804 3.29289 11.2929L10.2929 4.29289C10.6834 3.90237 11.3166 3.90237 11.7071 4.29289Z" fill="#000000"></path> </g></svg>
        Designer
    </a>
    <label class="ml-auto swap items-center">
        <button aria-label='toggle verified' onclick={() => {filter = ((filter + 1) % 3); record_load_iteration = 0; loadedRecords = []; loadGallery();}}>
            Filter: <span class="opacity-75">{filter_list[filter]}</span>
        </button>
    </label>
</div>
{#if !loadingRecords}
    <!-- GALLERY -->
    <div class="flex flex-row flex-wrap w-full max-w-[100vw] sm:max-w-[1000px] mx-auto gap-3 pt-6 justify-center mb-10">
        {#each loadedRecords as record, i}
            <GalleryCard {record} {i} {well_colors} />
        {/each}
    </div>
{:else}
    <div class="flex flex-row flex-wrap w-full max-w-[100vw] sm:max-w-[1000px] mx-auto gap-3 pt-6 justify-center mb-10">
        {#each Array(15).fill(0) as _, i}
            <div class="skeleton min-h-[350px] min-w-[175px] px-3 py-3">
            </div>
        {/each}
    </div>
{/if}