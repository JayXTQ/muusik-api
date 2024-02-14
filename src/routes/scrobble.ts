import { Hono } from 'hono';
import axios from 'axios';
import { createHash } from 'crypto';

export default function (app: Hono) {
    app.post('/scrobble', async (c) => {
        c.header('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN);
        c.header('Access-Control-Allow-Credentials', 'true');

        const { user, artist, track, album, timestamp } =
            (await c.req.json()) as {
                user: string;
                artist: string;
                track: string;
                album: string;
                timestamp: string;
            };
        if (!user || !artist || !track || !album || !timestamp) {
            c.status(400);
            return c.json({
                success: false,
                message: 'Required information missing',
            });
        }
        const signature = generateSignature(
            'track.scrobble',
            user,
            artist,
            track,
            album,
            timestamp,
        );
        const res = await axios.post(
            `http://ws.audioscrobbler.com/2.0/?method=track.scrobble&artist=${artist}&track=${track}&album=${album}&timestamp=${timestamp}&api_key=${process.env.LASTFM_API_KEY}&api_sig=${signature}&sk=${user}&format=json`,
        );
        if (res.status !== 200) {
            return c.json({
                success: false,
                message: 'Scrobbling failed',
                status: res.status,
            });
        }
        c.status(200);
        return c.json({ success: true });
    });
}

function generateSignature(
    method: string,
    token: string,
    artist: string,
    track: string,
    album: string,
    timestamp: string,
): string {
    return createHash('md5')
        .update(
            `api_key${process.env.LASTFM_API_KEY}method${method}token${token}artist${artist}track${track}album${album}timestamp${timestamp}${process.env.LASTFM_SECRET}`,
        )
        .digest('hex')
        .toString();
}
