import { Hono } from 'hono';
import axios from 'axios';

export default function (app: Hono) {
    app.get('/find-song', async (c) => {
        c.header('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN);
        c.header('Access-Control-Allow-Credentials', 'true');

        const { query } = c.req.query() as { query: string };
        let { limit } = c.req.query() as { limit: string | number };
        limit = limit ? parseInt(limit as string) : 10;

        if (!query || query === 'undefined') {
            c.status(400);
            return c.json({ success: false, message: 'No query provided' });
        }

        try {
            const response = await axios.get(
                `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(decodeURIComponent(query))}&api_key=${process.env.LASTFM_API_KEY}&format=json`,
            );

            if (response.status !== 200) {
                c.status(400);
                return c.json({
                    success: false,
                    message: 'Error fetching song',
                });
            }

            const tracks = response.data.results.trackmatches.track;
            const searchLimit = Math.min(limit, tracks.length);
            const limitedTracks = tracks.slice(0, searchLimit);

            c.status(200);
            return c.json({ tracks: { track: limitedTracks }, success: true });
        } catch (error: any) {
            console.error('Error in /find-song route:', error);
            c.status(500);
            return c.json({
                success: false,
                message: 'Server error',
                details: error.message,
            });
        }
    });
}
