// import { json } from '@sveltejs/kit';
// import { parseGenbank } from '$lib/genbankParser.js';
// import fetch from 'node-fetch';
// import { BENCHLING_API_KEY } from '$env/static/private'; // pull from .env or SvelteKit private env

// /** Helper to call Benchling API */
// async function createBenchlingSequence({ genbankString, folderId }) {
//   if (!BENCHLING_API_KEY) throw new Error('Benchling API key not set');

//   const parsed = parseGenbank(genbankString);

//   const annotations = parsed.features.map(f => ({
//     start: f.start,
//     end: f.end,
//     type: f.type,
//     strand: f.strand === -1 ? 'NEGATIVE' : 'POSITIVE',
//     qualifiers: f.qualifiers
//   }));

//   const body = {
//     name: parsed.locus || 'Imported Sequence',
//     bases: parsed.sequence,
//     circular: parsed.topology === 'circular',
//     folderId,
//     annotations
//   };

//   const res = await fetch('https://api.benchling.com/v2/sequences', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${BENCHLING_API_KEY}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(body)
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`Benchling API error: ${res.status} ${text}`);
//   }

//   const result = await res.json();
//   return {
//     id: result.id,
//     url: `https://benchling.com/s/${result.id}`
//   };
// }

// export async function POST({ request }) {
//   try {
//     const { genbankString, folderId } = await request.json();
//     const result = await createBenchlingSequence({ genbankString, folderId });
//     return json({ success: true, url: result.url });
//   } catch (err) {
//     console.error(err);
//     return json({ success: false, error: err.message }, { status: 500 });
//   }
// }
