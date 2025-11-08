<script>
    import { onMount, tick } from 'svelte';
    import { browser } from '$app/environment';
    import { digest, enzymes, lambda_dna } from '$lib/digest.js';

    let columns = $state(12);
    let selected_column = $state(null);

    onMount(() => {
        if (!browser) return;

        window.addEventListener('keydown', event => {
            const directions = {
                ArrowUp: 'up',
                ArrowDown: 'down',
                ArrowLeft: 'left',
                ArrowRight: 'right',
            };


        if (event.key === 'Backspace') {
            event.preventDefault();
            if (bands[selected_column]) {
                bands[selected_column] = {
                    ...bands[selected_column],
                    digestList: buildDigestList(),
                    enzymesUsed: [],
                    currentBands: [],
                    index: 0,
                    isLadder: false,
                };
                bands = { ...bands };
            }
        }

        if (event.code === 'Space') {
            event.preventDefault();
            if (bands[selected_column]) {
                bands[selected_column] = {
                    ...bands[selected_column],
                    digestList: buildDigestList(),
                    enzymesUsed: [],
                    currentBands: [...LADDER],
                    index: 0,
                    isLadder: true,
                };
                bands = { ...bands };
            }
        }

            if (selected_column === null) selected_column = 1;

            const direction = directions[event.key];
            if (!direction) return;

            if (direction === 'left') {
                event.preventDefault();
                selected_column = (selected_column - 1 + columns) % columns;
            }

            if (direction === 'right') {
                event.preventDefault();
                selected_column = (selected_column + 1) % columns;
            }

            if (direction === 'up' || direction === 'down') {
                event.preventDefault();
                bands[selected_column].currentBands = iterateDigest(selected_column, lambda_dna, direction);
                bands = { ...bands };
            }
        });
    });

    function enzymeCombinations(list, k) {
        const out = [];
        function rec(start, prev) {
            if (prev.length === k) {
                out.push([...prev]);
                return;
            }
            for (let i = start; i < list.length; i++) {
                prev.push(list[i]);
                rec(i + 1, prev);
                prev.pop();
            }
        }
        rec(0, []);
        return out;
    }

    export function buildDigestList() {
        const singles = enzymeCombinations(enzymes, 1);
        const doubles = enzymeCombinations(enzymes, 2);
        // const triples = enzymeCombinations(enzymes, 3);

        return [...singles, ...doubles];
    }

    const LADDER = [15000, 10000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1500, 1000, 850, 650, 500, 400, 300, 200, 100];

    function bpToPx(bp, height = 250, bandH = 5) {
        const log = (x) => Math.log10(x);
        const maxLog = log(LADDER[0]);
        const minLog = log(LADDER[LADDER.length - 1]);
        const bpLog = log(bp);

        if (bpLog >= maxLog) return 0;
        if (bpLog <= minLog) return height - bandH;

        const t = (maxLog - bpLog) / (maxLog - minLog);
        return t * (height - bandH);
    }

    let bands = $state(
        Object.fromEntries(
            Array.from({ length: 13 }, (_, i) => [
                i,
                { index: 0, digestList: buildDigestList(), enzymesUsed: [], isLadder: false }
            ])
        )
    );

    function iterateDigest(column, DNA, direction) { 
        const col = bands[column];
        const max = col.digestList.length; 
        const selectedEnzymes = col.digestList[col.index];
        col.enzymesUsed = selectedEnzymes.map(e => e.name); 
        if (direction === 'up') col.index = (col.index - 1 + max) % max; 
        if (direction === 'down') col.index = (col.index + 1) % max; 
        return digest(DNA, selectedEnzymes); 
    }






    function calculateWater(sum) {
            const totalVolume = 20;
            return totalVolume - sum;
        }
            const totalVolume = 20; // µL

    function bufferVolume(enzymes) {
        if (enzymes.length === 0 || enzymes[0] === 'Ladder') return 0;
        return 2;
    }

    function dnaVolume() {
        return 3; 
    }

    function ladderVolume() {
        return 1;
    }

    function waterVolume(enzymes) {
        if (enzymes.length === 0 || enzymes[0] === 'Ladder') return 0;
        const enzymeVol = enzymes.length * 1; // 1 μL per enzyme
        const bufferVol = bufferVolume(enzymes);
        const dnaVol = dnaVolume();
        return totalVolume - enzymeVol - bufferVol - dnaVol;
    }
</script>
<article class="prose w-full mx-auto mt-5">
    <h2 class="text-center text-neutral">DNA Gel Artwork</h2>
</article>

<div class="flex flex-col w-full max-w-[100vw] sm:max-w-[490px] mx-auto px-5 pt-5">
    <div class="flex flex-row mx-auto w-full justify-between">

        {#each Array.from({ length: columns }) as _, column}
            <div class="flex flex-col flex-1">
                <p class="text-center text-gray-500 pb-1">{column + 1}</p>
                <div
                    class="relative h-[250px] bg-gray-100 {selected_column === column ? 'outline outline-1 z-20 rounded-sm' : ''}"
                    onclick={() => { selected_column = column; }}
                >
                    {#if bands[column]?.currentBands?.length > 0}
                        {#each bands[column].currentBands as bp}
                            <div
                                class="absolute left-1 right-1 bg-gray-400 h-[5px]"
                                style="top:{bpToPx(bp)}px"
                            />
                        {/each}
                    {/if}
                </div>
                {#if selected_column === column}
                    <div class="flex flex-col items-center w-full">
                        <div class="flex w-full max-w-full justify-center">
                            <button class="btn btn-xs px-1 py-0 bg-gray-100"
                                onclick={() => {
                                    bands[selected_column].currentBands = iterateDigest(selected_column, lambda_dna, 'down');
                                    bands = { ...bands };
                                }}>
                                &lt;
                            </button>

                            <button class="btn btn-xs px-1 py-0 bg-gray-100"
                                onclick={() => {
                                    bands[selected_column].currentBands = iterateDigest(selected_column, lambda_dna, 'up');
                                    bands = { ...bands };
                                }}>
                                &gt;
                            </button>
                        </div>

                        <button class="btn btn-xs px-1 py-0 bg-gray-100 w-full"
                            onclick={() => {
                                bands[selected_column] = {
                                    ...bands[selected_column],
                                    digestList: buildDigestList(),
                                    enzymesUsed: [],
                                    currentBands: [],
                                    index: 0,
                                    isLadder: false,
                                };
                                bands = { ...bands };
                            }}>
                            <svg class="w-3 h-3 opacity-75" fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M22,5a1,1,0,0,1-1,1H3A1,1,0,0,1,3,4H8V3A1,1,0,0,1,9,2h6a1,1,0,0,1,1,1V4h5A1,1,0,0,1,22,5ZM4.934,21.071,4,8H20l-.934,13.071a1,1,0,0,1-1,.929H5.931A1,1,0,0,1,4.934,21.071ZM15,18a1,1,0,0,0,2,0V12a1,1,0,0,0-2,0Zm-4,0a1,1,0,0,0,2,0V12a1,1,0,0,0-2,0ZM7,18a1,1,0,0,0,2,0V12a1,1,0,0,0-2,0Z"></path></g></svg>
                        </button>
                    </div>
                {/if}
            </div>
        {/each}

    </div>
    <div class="flex flex-row justify-between">
        <div class="pt-3">
            <button class="join-item btn btn-xs rounded bg-gray-100"
                    onclick={() => { 
                        if (bands[selected_column]) {
                            bands[selected_column] = {
                                ...bands[selected_column],
                                digestList: buildDigestList(),
                                enzymesUsed: [],
                                currentBands: [...LADDER],
                                index: 0,
                                isLadder: true,
                            };
                            bands = { ...bands };
                        }}}>
                + Ladder
            </button>
        </div>
        <div class="ml-auto join pt-3">
            <button class="join-item btn btn-xs rounded bg-gray-100"
                    onclick={() => {
                        if (columns > 1) columns -= 1;
                    }}>
                -
            </button>
            <button class="join-item btn btn-xs rounded bg-gray-100"
                    onclick={() => {
                        const newIndex = columns; // next index
                        bands = {
                            ...bands,
                            [newIndex]: {
                                index: 0,
                                digestList: buildDigestList(),
                                enzymesUsed: []
                            }
                        };
                        columns += 1;
                    }}>
                +
            </button>
        </div>
    </div>
</div>

<div class="flex flex-col w-full max-w-[100vw] sm:max-w-[750px] mx-auto px-5 pt-5">
<article class="prose w-full mx-auto mt-5">
    <h4 class="text-left text-neutral ">Restriction Digest</h4>
</article>
<table class="border border-gray-300 my-2 w-full">
    <thead>
        <tr class="bg-gray-200">
            <th class="px-1 py-1 text-xs"></th>
            {#each Array.from({ length: columns }) as _, col}
                <th class="px-3 py-1 text-sm">{col + 1}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
    <!-- Enzymes -->
    <tr>
        <td class="px-2 py-1 font-semibold text-xs">Enzyme(s)</td>
        {#each Array.from({ length: columns }) as _, col}
    {#key bands[col].index} 
    <td class="px-1 py-1 text-xs border border-gray-300/30">
        {#if bands[col].isLadder}
                <span
                    class="cursor-pointer"
                    onclick={e => {
                        if (e.currentTarget.classList.contains('line-through')) {
                            e.currentTarget.classList.remove('line-through', 'opacity-50');
                        } else {
                            e.currentTarget.classList.add('line-through', 'opacity-50');
                        }
                    }}
                >
                    1 μL Ladder
                </span>
        {:else if bands[col]?.enzymesUsed.length >= 1}
            {#each bands[col].enzymesUsed as enzyme}
                <span
                    class="cursor-pointer"
                    onclick={e => {
                        if (e.currentTarget.classList.contains('line-through')) {
                            e.currentTarget.classList.remove('line-through', 'opacity-50');
                        } else {
                            e.currentTarget.classList.add('line-through', 'opacity-50');
                        }
                    }}
                >
                    1 μL {enzyme}
                </span>
                <br class="pb-1" />
            {/each}
        {:else}
            <p class="opacity-25">-</p>
        {/if}
    </td>
    {/key}
{/each}

    </tr>

<!-- CutSmart Buffer -->
<tr>
    <td class="px-2 py-1 font-semibold text-xs border border-gray-300/30">CutSmart Buffer</td>
    {#each Array.from({ length: columns }) as _, col}
        {#key bands[col].index}
        <td class="px-1 py-1 text-xs border border-gray-300/30">
            {#if bands[col].isLadder}
                <p class="opacity-25">-</p>
            {:else if bands[col]?.enzymesUsed.length >= 1}
                <span
                    class="cursor-pointer"
                    onclick={e => {
                        if (e.currentTarget.classList.contains('line-through')) {
                            e.currentTarget.classList.remove('line-through', 'opacity-50');
                        } else {
                            e.currentTarget.classList.add('line-through', 'opacity-50');
                        }
                    }}
                >
                    2 μL
                </span>
            {:else}
                <p class="opacity-25">-</p>
            {/if}
        </td>
        {/key}
    {/each}
</tr>

<!-- Lambda DNA -->
<tr>
    <td class="px-2 py-1 font-semibold text-xs border border-gray-300/30">λ DNA</td>
    {#each Array.from({ length: columns }) as _, col}
        {#key bands[col].index}
        <td class="px-1 py-1 text-xs border border-gray-300/30">
            {#if bands[col].isLadder}
                 <p class="opacity-25">-</p>
            {:else if bands[col]?.enzymesUsed.length > 0 || bands[col]?.currentBands?.length === LADDER.length}
                <span
                    class="cursor-pointer"
                    onclick={e => {
                        if (e.currentTarget.classList.contains('line-through')) {
                            e.currentTarget.classList.remove('line-through', 'opacity-50');
                        } else {
                            e.currentTarget.classList.add('line-through', 'opacity-50');
                        }
                    }}
                >
                    {dnaVolume()} μL
                </span>
            {:else}
                <p class="opacity-25">-</p>
            {/if}
        </td>
        {/key}
    {/each}
</tr>

<!-- Water -->
<tr>
    <td class="px-2 py-1 font-semibold text-xs border border-gray-300/30">Water</td>
    {#each Array.from({ length: columns }) as _, col}
        {#key bands[col].index}
        <td class="px-1 py-1 text-xs border border-gray-300/30">
            {#if bands[col].isLadder}
                <span
                    class="cursor-pointer"
                    onclick={e => {
                        if (e.currentTarget.classList.contains('line-through')) {
                            e.currentTarget.classList.remove('line-through', 'opacity-50');
                        } else {
                            e.currentTarget.classList.add('line-through', 'opacity-50');
                        }
                    }}
                >
                    {calculateWater(ladderVolume())} μL
                </span>
            {:else if bands[col]?.enzymesUsed.length > 0}
                <span
                    class="cursor-pointer"
                    onclick={e => {
                        if (e.currentTarget.classList.contains('line-through')) {
                            e.currentTarget.classList.remove('line-through', 'opacity-50');
                        } else {
                            e.currentTarget.classList.add('line-through', 'opacity-50');
                        }
                    }}
                >
                    {calculateWater(bands[col].enzymesUsed.length + bufferVolume(bands[col].enzymesUsed) + dnaVolume())} μL
                </span>
            {:else}
                <p class="opacity-25">-</p>
            {/if}
        </td>
        {/key}
    {/each}
</tr>

</tbody>

</table>
</div>


<div class="flex flex-col w-full max-w-[100vw] sm:max-w-[490px] mx-auto px-5 pt-5">
    <article class="prose w-full mx-auto mt-5">
        <h4 class="text-left text-neutral">Restriction Digest Parameters</h4>
    </article>
    <hr class="pb-5" />
    <div class="text-sm">
        37°C, 60 minutes: incubation <br />
        80°C, 20 minutes: heat inactivation <span class="opacity-40">(optional)</span>
    </div>
</div>

<div class="flex flex-col w-full max-w-[100vw] sm:max-w-[490px] mx-auto px-5 pt-5 pb-20">
    <article class="prose w-full mx-auto mt-5">
        <h4 class="text-left text-neutral">DNA Gel Electrophoresis</h4>
    </article>
    <hr class="pb-5" />
    <div class="flex flex-row justify-around">
            <div class="text-sm">
                <div class="font-bold">Standard Agarose</div>
                10 μL Water <br />
                3 μL Loading Dye <br />
                7 μL Digest <br />
            </div>
            <div class="text-sm">
                <div class="font-bold">E-Gel</div>
                3 μL Loading Dye <br />
                7 μL Digest <br />
            </div>
    </div>
</div>

