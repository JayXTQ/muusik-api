import { Hono } from 'hono';

export default function (app: Hono, dev: boolean) {
    app.get('/auth/:type', async (c) => {
        const { type } = c.req.param();
        switch (type) {
            case 'lastfm':
                c.status(303);
                return c.redirect(
                    `https://www.last.fm/api/auth/?api_key=${encodeURIComponent(
                        process.env.LASTFM_API_KEY as string,
                    )}&cb=${encodeURIComponent(
                        `http${
                            dev ? '://localhost:5173' : 's://muusik.app'
                        }/callback/lastfm`,
                    )}`,
                );
        }
        return c.json({ success: false });
    });
}
