// import PocketBase from 'pocketbase';
// import OpenAI from "openai";
// import { PB_EMAIL, PB_PASSWORD, OPENAI_API_KEY } from '$env/static/private';

// const pb = new PocketBase("https://opentrons-art-pb.rcdonovan.com");

// export const POST = async ({ request }) => {
//     let { user_design, dimension } = await request.json();
//     const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
//     let messages = [];

//     try {
//         await pb.admins.authWithPassword(PB_EMAIL, PB_PASSWORD);
//         let record = await pb.collection('prompts').getOne('4709iste4li1a07', {fields: `instructions,max_completion_tokens,temperature,model`});
//         const model = record.model;
//         let instructions = record.instructions;
//         instructions = instructions.replaceAll('${USER_DIMENSION}', dimension);
//         instructions = instructions.replaceAll('${USER_DESIGN}', user_design);
//         console.log(instructions);

//         messages.push({ role: "user", content: instructions });

//         let response = await openai.chat.completions.create({ 
//             model: model,
//             messages,
//             max_completion_tokens: record.max_completion_tokens
//         });
//         const content = response?.choices?.[0]?.message?.content || "No content received";
//         console.log(response);
//         console.log(response?.choices?.[0]?.message)
//         console.log("Response content:", content);

//         return new Response(JSON.stringify({ success: true, result: content }));
//     } catch (e) {
//         console.log('Query failed', e);
//         return new Response(JSON.stringify({success: false}))
//     }
// };