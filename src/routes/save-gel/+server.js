import PocketBase from 'pocketbase';
import { PB_EMAIL, PB_PASSWORD } from '$env/static/private';

const pb = new PocketBase("https://opentrons-art-pb.rcdonovan.com");

export const POST = async ({ request }) => {
    let { title, author, columns, stack_mode, bands, bottom_bands, current_enzymes } = await request.json();
    try {
        await pb.admins.authWithPassword(PB_EMAIL, PB_PASSWORD);
        // confirm we aren't adding the same art repeatedly, use _.isEqual because the objects are unordered
        // const recentEntry = await pb.collection("gels").getList(1, 1, { sort: "-created" });
        // if ( JSON.stringify(Object.entries(point_colors).sort()) === JSON.stringify(Object.entries(recentEntry.items[0].point_colors).sort())) {
        //     return new Response(JSON.stringify({ success: true, duplicate: true }));
        // }
        if (!stack_mode) {
            bottom_bands = {};
        }

        const newEntry = await pb.collection("gels").create({
            title, author, columns, stack_mode, bands, bottom_bands, current_enzymes
        });

        return new Response(JSON.stringify({success: true, duplicate: false}));
    } catch (e) {
        console.log(e)
        return new Response(JSON.stringify({success: false, duplicate: false}))
    }
};