<script>
	import ScrollSelect from '$lib/components/ScrollSelect.svelte';
	import { makeGenbank, parseGenbank } from '$lib/components/GenBank.js';
	import { start_codon_options, stop_codon_options } from '$lib/dna_snippets.js';
	import { pTwistAmpHighCopy, pTwistChlorHighCopy, pTwistKanHighCopy, puc19 } from '$lib/twist_vectors.js';
	import VectorCard from '$lib/components/VectorCard.svelte';

	const { data } = $props();
	const parts = data.parts;
	
	const promoter_category = data.parts.filter(p => p.categories?.includes("promoter"));
	let promoter_category_selection = $state();

	const rbs_options = data.parts.filter(p => p.part_type?.includes("RBS"));
	let rbs_selection = $state();

	const reporter_options = data.parts.filter(p => p.part_type?.includes("Reporter"));
	let reporter_selection = $state();

	const terminator_options = data.parts.filter(p => p.part_type?.includes("Terminator"));
	let terminator_selection = $state();

	let start_codon_selection = $state();
	let stop_codon_selection = $state();
	
	let full_sequence = $state();
	let genbank_text = $state('');
	let sequence_format = $state('circular'); // circular or linear
	let selected_backbone_vector = $state(pTwistAmpHighCopy);

	$effect(() => {
		const parsedGenbank = parseGenbank(selected_backbone_vector.genbank);

		const backboneFeatures = parsedGenbank.features.map(f => ({
			type: f.type,
			name: f.qualifiers.label || "",
			note: f.qualifiers.note || "",
			start: f.start,
			end: f.end,
			strand: f.strand
		}));

		let seq =
			promoter_category[promoter_category_selection].sequence +
			rbs_options[rbs_selection].sequence +
			start_codon_options[start_codon_selection].sequence +
			reporter_options[reporter_selection].sequence +
			stop_codon_options[stop_codon_selection].sequence +
			terminator_options[terminator_selection].sequence;

		const shiftedBackbone = shiftFeatures(backboneFeatures, seq.length);

		const finalSeq = seq + (sequence_format === "circular" ? parsedGenbank.sequence : "");

		// Build features
		let features = [];
		let pos = 1;

		const addFeature = (type, name, fragment) => {
			const start = pos;
			const end = pos + fragment.length - 1;
			features.push({ type, name, start, end });
			pos = end + 1;
		};

		addFeature("promoter", "promoter", promoter_category[promoter_category_selection].sequence);
		addFeature("RBS", "RBS", rbs_options[rbs_selection].sequence);
		addFeature(
			"CDS",
			"CDS",
			start_codon_options[start_codon_selection].sequence +
				reporter_options[reporter_selection].sequence +
				stop_codon_options[stop_codon_selection].sequence
		);
		addFeature("terminator", "terminator", terminator_options[terminator_selection].sequence);

		if (sequence_format === "circular") {
			features = [...features, ...shiftedBackbone];
		}

		full_sequence = finalSeq;
		genbank_text = makeGenbank(features, finalSeq, sequence_format);
	});


	function shiftFeatures(features, offset) {
		return features.map(f => ({
			...f,
			start: f.start + offset,
			end: f.end + offset
		}));
	}

	function downloadFile(filename, content) {
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();

		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function copySequenceToClipboard() {
        try {
            // Get the content to copy
            let content = full_sequence;
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

	let isClonalGene = $state(true);
</script>

<article class="prose w-full mx-auto mt-5">
    <h2 class="text-center text-neutral">Monostable Biosensor Builder</h2>
</article>

<div class="flex flex-col gap-6 mt-6">
	<!-- PROMOTER CLASS -->
	<ScrollSelect title="Promoter" options={promoter_category} bind:selected={promoter_category_selection} width="w-64"/>

	<!-- RBS -->
	<ScrollSelect title="Ribosome Binding Site" options={rbs_options} bind:selected={rbs_selection} width="w-64"/>

	<!-- Start Codon -->
	<ScrollSelect title="Start Codon" options={start_codon_options} bind:selected={start_codon_selection} width="w-64"/>

	<!-- ORF -->
	<ScrollSelect title="Reporter" options={reporter_options} bind:selected={reporter_selection} width="w-64"/>

	<!-- Stop Codon -->
	<ScrollSelect title="Stop Codon" options={stop_codon_options} bind:selected={stop_codon_selection} width="w-64"/>

	<!-- Terminator -->
	<ScrollSelect title="Terminator" options={terminator_options} bind:selected={terminator_selection} width="w-64"/>

	<h3 class="text-center underline text-neutral">Circuit Diagram</h3>
	<img src={`/circuit/monostable.svg`} alt={`question mark illustration`} class="mx-auto w-full max-w-[175px] rounded-lg opacity-80"/>

	<h3 class="text-center underline text-neutral">Twist Vector</h3>
	
	<div class="flex flex-row w-full flex-wrap gap-2 justify-center">
		{#each [pTwistAmpHighCopy, pTwistChlorHighCopy, pTwistKanHighCopy, puc19] as v}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="w-[35%] sm:w-[25%] md:w-[20%] lg:w-[15%] xl:w-[13%]" onclick={() => {selected_backbone_vector = v}}>
				<VectorCard backbone_vector={v} {selected_backbone_vector}/>
			</div>
		{/each}
	</div>
	
	<br />

</div>

{#if genbank_text}
	<div class="bg-gray-100 p-2 rounded-sm w-full px-5 max-w-[75%] mx-auto mb-10">
		<div class="flex flex-row justify-between items-center mb-4">
			<span class="font-semibold">
				GenBank Sequence
				<div class="ml-3 join">
					<button class="join-item btn btn-xs rounded {sequence_format === 'circular' ? 'btn-neutral' : ''}"
							onclick={() => sequence_format = 'circular'}>
						Plasmid
					</button>
					<button class="join-item btn btn-xs rounded {sequence_format === 'circular' ? '' : 'btn-neutral'}"
							onclick={() => sequence_format = 'linear'}>
						Fragment
					</button>
				</div>
			</span>
			<div class="flex flex-row flex-wrap justify-end gap-2 max-w-full overflow-hidden">
				<button class="btn btn-sm px-2 tooltip tooltip-top opacity-70" onclick={() => downloadFile('CustomDNASequence.gb', genbank_text)} aria-label="Download GenBank" data-tip="Download GenBank">
					<svg class="w-4 h-4 inline-block align-middle" transform="scale(1.3) translate(-0.5 -0.25)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.0" d="M12 5v8.5m0 0l3-3m-3 3l-3-3M5 15v2a2 2 0 002 2h10a2 2 0 002-2v-2" /></svg>
				</button>
				<button class="btn btn-sm px-2 tooltip tooltip-top" onclick={() => copySequenceToClipboard()} aria-label="Copy Sequence" data-tip="Copy To Clipboard">
					<svg class="w-5 h-5 opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M10 8V7C10 6.05719 10 5.58579 10.2929 5.29289C10.5858 5 11.0572 5 12 5H17C17.9428 5 18.4142 5 18.7071 5.29289C19 5.58579 19 6.05719 19 7V12C19 12.9428 19 13.4142 18.7071 13.7071C18.4142 14 17.9428 14 17 14H16M7 19H12C12.9428 19 13.4142 19 13.7071 18.7071C14 18.4142 14 17.9428 14 17V12C14 11.0572 14 10.5858 13.7071 10.2929C13.4142 10 12.9428 10 12 10H7C6.05719 10 5.58579 10 5.29289 10.2929C5 10.5858 5 11.0572 5 12V17C5 17.9428 5 18.4142 5.29289 18.7071C5.58579 19 6.05719 19 7 19Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>
		</div>

		<pre class="text-neutral text-xs overflow-x-auto max-w-full whitespace-pre-wrap">
			{genbank_text}
		</pre>
	</div>
{/if}