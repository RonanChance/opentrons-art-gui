import PocketBase from 'pocketbase';
import { PB_EMAIL, PB_PASSWORD } from '$env/static/private';

const pb = new PocketBase("https://opentrons-art-pb.rcdonovan.com");

export const POST = async ({ request }) => {
    let { num } = await request.json();
    try {
        await pb.admins.authWithPassword(PB_EMAIL, PB_PASSWORD);
        const records = await pb.collection('designs').getList(1, num, { sort: '-created' });

        return new Response(JSON.stringify({ success: true, records: records.items }));
    } catch (e) {
        console.log('Record request failed', e);
        return new Response(JSON.stringify({success: false}))
    }
};