import { Hono } from 'hono';
import { createHash } from 'crypto';
import axios from 'axios';

export default function (app: Hono) {
    app.get('/session/:type', async (c) => {
        c.header('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN);
        c.header('Access-Control-Allow-Credentials', 'true');
        const { type } = c.req.param();
        const { token } = c.req.query();
        switch (type) {
            case 'lastfm': {
                let session;
                try {
                    session = await axios.get(
                        `http://ws.audioscrobbler.com/2.0/?method=auth.getSession&sk=${encodeURIComponent(
                            token,
                        )}&api_key=${encodeURIComponent(
                            generateSigniture('auth.getSession', token),
                        )}&format=json`,
                    );
                } catch (e) {
                    return c.json({ success: false, message: e });
                }
            }
        }
    });
}

function generateSigniture(method: string, token: string) {
    return createHash('md5')
        .update(
            `api_key${
                process.env.LASTFM_API_KEY as string
            }method${method}token${token}${process.env.LASTFM_SECRET as string}`,
        )
        .digest('hex')
        .toString();
}
