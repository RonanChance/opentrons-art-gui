import PocketBase from 'pocketbase';
import OpenAI from "openai";
import { PB_EMAIL, PB_PASSWORD, OPENAI_API_KEY } from '$env/static/private';

const pb = new PocketBase("https://opentrons-art-pb.rcdonovan.com");

export const POST = async ({ request }) => {
    let { user_design, Formatted2DList } = await request.json();
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    let messages = [];

    try {
        await pb.admins.authWithPassword(PB_EMAIL, PB_PASSWORD);
        let record = await pb.collection('prompts').getOne('4709iste4li1a07', {fields: `instructions,max_tokens,temperature,model`});
        const model = record.model;
        let instructions = record.instructions;
        instructions = instructions.replaceAll('${USER_DESIGN}', user_design);
        instructions = instructions.replaceAll('${USER_GRID}', Formatted2DList);

        messages.push({ role: "user", content: instructions });

        let response = await openai.chat.completions.create({ 
            model: model,
            messages,
            temperature: record.temperature,
            max_tokens: record.max_tokens
        });

        return new Response(JSON.stringify({ success: true, result: response?.choices?.[0]?.message?.content || null }));
    } catch (e) {
        console.log('Query failed', e);
        return new Response(JSON.stringify({success: false}))
    }
};