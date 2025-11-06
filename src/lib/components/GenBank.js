export function makeGenbank(features, seq, sequence_format, seqName = "CustomSeq") {
	const lines = [];

	// LOCUS line
	lines.push(`LOCUS       ${seqName} ${seq.length} bp    DNA     ${sequence_format}   UNK`);

	// FEATURES block
	lines.push("FEATURES             Location/Qualifiers");
	for (const f of features) {
		const start = f.start;
		const end = f.end;
		// Use a type Benchling will display reliably
		const type = f.type 
		lines.push(`     ${type.padEnd(16)} ${start}..${end}`);
		lines.push(`                     /label="${f.name}"`);
		lines.push(`                     /note="${f.note || ""}"`);
	}

	// ORIGIN sequence block
	lines.push("ORIGIN");
	const chunked = seq.match(/.{1,60}/g) || [];
	for (let i = 0; i < chunked.length; i++) {
		const seqLine = chunked[i];
		const offset = (i * 60 + 1).toString().padStart(9, " ");
		// Add spaces every 10 bases for readability
		const formatted = seqLine.match(/.{1,10}/g).join(" ");
		lines.push(`${offset} ${formatted}`);
	}

	lines.push("//"); // End of GenBank file
	return lines.join("\n");
}

export function parseGenbank(raw) {
	const lines = raw.split(/\r?\n/);

	let locus = null;
	let size = null;
	let topology = null;
	let features = [];
	let seq = [];

	let inFeatures = false;
	let inOrigin = false;
	let currentFeature = null;
	let currentQualifier = null;

	for (const line of lines) {
		// LOCUS
		if (line.startsWith("LOCUS")) {
			const parts = line.trim().split(/\s+/);
			locus = parts[1];
			size = parseInt(parts[2]);
			topology = parts.includes("circular") ? "circular" : "linear";
			continue;
		}

		// FEATURES start
		if (line.startsWith("FEATURES")) {
			inFeatures = true;
			continue;
		}

		// ORIGIN start
		if (line.startsWith("ORIGIN")) {
			inOrigin = true;
			inFeatures = false;
			continue;
		}

		// Features block
		if (inFeatures) {
			// New feature
			if (/^\s{5}\S/.test(line)) {
				if (currentFeature) features.push(currentFeature);
				const type = line.slice(5, 21).trim();
				const loc = line.slice(21).trim();

				let strand = 1;
				let start = null;
				let end = null;

				// complement
				if (loc.startsWith("complement(")) {
					const range = loc.match(/complement\((\d+)\.\.(\d+)\)/);
					if (range) {
						strand = -1;
						start = parseInt(range[1]);
						end = parseInt(range[2]);
					}
				} else {
					// normal range
					const range = loc.match(/(\d+)\.\.(\d+)/);
					if (range) {
						start = parseInt(range[1]);
						end = parseInt(range[2]);
					} else if (loc.includes("^")) {
						// caret site, e.g., 2097^2098
						const caretMatch = loc.match(/(\d+)\^(\d+)/);
						if (caretMatch) {
							start = parseInt(caretMatch[1]);
							end = parseInt(caretMatch[2]);
						}
					}
				}
				currentFeature = { type, start, end, strand, qualifiers: {} };
				currentQualifier = null;
				continue;
			}

			// Qualifiers
			const qualifierLineMatch = line.match(/^\s{21}\/(\w+)=(.*)$/);
			if (qualifierLineMatch) {
				const key = qualifierLineMatch[1];
				let value = qualifierLineMatch[2].trim();
				// remove starting/ending quotes if present
				if (value.startsWith('"')) value = value.slice(1);
				if (value.endsWith('"')) value = value.slice(0, -1);
				currentFeature.qualifiers[key] = value;
				currentQualifier = key;
				continue;
			}

			// Continuation of previous qualifier
			if (/^\s{21}/.test(line) && currentQualifier) {
				let value = line.trim();
				if (value.endsWith('"')) value = value.slice(0, -1);
				currentFeature.qualifiers[currentQualifier] += " " + value;
			}
		}

		if (inOrigin) {
			const m = line.match(/^\s*\d+\s+([acgtACGT\s]+)/);
			if (m?.[1]) {
				const cleaned = m[1].replace(/\s+/g, "").toLowerCase();
				seq.push(cleaned);
			}
		}
	}

	if (currentFeature) features.push(currentFeature);

	return {
		locus,
		size,
		topology,
		features,
		sequence: seq.join("").toUpperCase()
	};
}
