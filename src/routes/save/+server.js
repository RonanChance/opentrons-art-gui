import PocketBase from 'pocketbase';
import { PB_EMAIL, PB_PASSWORD } from '$env/static/private';

const pb = new PocketBase("https://opentrons-art-pb.rcdonovan.com");

export const POST = async ({ request }) => {
    let { name, grid_style, radius_mm, radius_margin_mm, grid_spacing_mm, points, point_colors } = await request.json();
    console.log(name, radius_mm, radius_margin_mm, grid_spacing_mm, points, point_colors);

    try {
        await pb.admins.authWithPassword(PB_EMAIL, PB_PASSWORD);
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
        return new Response(JSON.stringify({success: true}));
    } catch (e) {
        return new Response(JSON.stringify({success: false}))
    }
};