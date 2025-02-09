import type { RequestHandler } from "@sveltejs/kit";
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';

const API_KEY = env.API_KEY;

export function apiverification() {
    return async (event: Parameters<RequestHandler>[0]) => {
        const apiKey = event.request.headers.get('api-key');

        if (!apiKey || apiKey !== API_KEY) {
            return json({ message: 'API access Unauthorized' }, { status: 401 });
        }
    };
}