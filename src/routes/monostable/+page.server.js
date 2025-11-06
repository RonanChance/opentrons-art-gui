import PocketBase from 'pocketbase';
import { PB_EMAIL, PB_PASSWORD } from '$env/static/private';

const pb = new PocketBase("http://127.0.0.1:8090");

export async function load() {
    try {
        await pb.admins.authWithPassword(PB_EMAIL, PB_PASSWORD);

        const allRecords = [];
        let page = 1;
        const perPage = 100;

        while (true) {
            const records = await pb.collection('parts').getList(page, perPage);
            allRecords.push(...records.items);

            if (records.items.length < perPage) break; // last page
            page++;
        }

        allRecords.sort((a, b) => Number(b.uses) - Number(a.uses));

        return {
            success: true,
            parts: allRecords
        };
    } catch (e) {
        console.error('Failed to fetch parts:', e);
        return {
            success: false,
            parts: [],
            error: e.message
        };
    }
}
