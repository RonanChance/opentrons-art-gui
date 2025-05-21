import PocketBase from 'pocketbase';
import { PB_EMAIL, PB_PASSWORD } from '$env/static/private';

const pb = new PocketBase("https://opentrons-art-pb.rcdonovan.com");

export const POST = async ({ request }) => {
    let { title, author, grid_style, radius_mm, grid_spacing_mm, points, point_colors, point_size } = await request.json();
    try {
        let num_drops = Object.keys(point_colors).length;
        let num_total = points.length;
        let unique_colors = [...new Set(Object.values(point_colors))];
        await pb.admins.authWithPassword(PB_EMAIL, PB_PASSWORD);

        // confirm we aren't adding the same art repeatedly, use _.isEqual because the objects are unordered
        const recentEntry = await pb.collection("designs").getList(1, 1, { sort: "-created" });
        if ( JSON.stringify(Object.entries(point_colors).sort()) === JSON.stringify(Object.entries(recentEntry.items[0].point_colors).sort())) {
            return new Response(JSON.stringify({ success: true, duplicate: true }));
        }

        const newEntry = await pb.collection("designs").create({
            title,
            author,
            grid_style,
            num_drops,
            num_total,
            unique_colors,
            radius_mm,
            grid_spacing_mm,
            point_size,
            points,
            point_colors,
            'description': null
        });

        return new Response(JSON.stringify({success: true, duplicate: false}));
    } catch (e) {
        return new Response(JSON.stringify({success: false, duplicate: false}))
    }
};