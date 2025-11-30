import PocketBase from 'pocketbase';
import { PB_EMAIL, PB_PASSWORD } from '$env/static/private';

const pb = new PocketBase("https://opentrons-art-pb.rcdonovan.com");

export const POST = async ({ request }) => {
    let { id } = await request.json();
    try {
        await pb.admins.authWithPassword(PB_EMAIL, PB_PASSWORD);
        const record = await pb.collection('gels').getOne(id);
        return new Response(JSON.stringify({ success: true, record: record }));
    } catch (e) {
        console.log('Record request failed', e);
        return new Response(JSON.stringify({success: false}))
    }
};