import PocketBase from 'pocketbase';
import { PB_EMAIL, PB_PASSWORD } from '$env/static/private';

const pb = new PocketBase("https://opentrons-art-pb.rcdonovan.com");

export const POST = async ({ request }) => {
    let { name, grid_style, radius_mm, radius_margin_mm, grid_spacing_mm, points, point_colors } = await request.json();

    try {
        await pb.admins.authWithPassword(PB_EMAIL, PB_PASSWORD);

        // confirm we aren't adding the same art repeatedly, use _.isEqual because the objects are unordered
        const recentEntry = await pb.collection("designs").getList(1, 1, { sort: "-created" });
        if ( JSON.stringify(Object.entries(point_colors).sort()) === JSON.stringify(Object.entries(recentEntry.items[0].point_colors).sort())) {
            return new Response(JSON.stringify({ success: true, duplicate: true }));
        }
        
        console.log('old', recentEntry.items[0].point_colors);
        console.log('new', point_colors)

        const newEntry = await pb.collection("designs").create({
            name,
            grid_style,
            radius_mm,
            radius_margin_mm,
            grid_spacing_mm,
            points,
            point_colors,
            'description': null
        });

        return new Response(JSON.stringify({success: true, duplicate: false}));
    } catch (e) {
        return new Response(JSON.stringify({success: false, duplicate: false}))
    }
};