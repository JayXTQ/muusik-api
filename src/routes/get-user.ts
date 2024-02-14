import { Hono } from 'hono';
import { Client } from 'discord.js';

export default function (app: Hono, client: Client) {
    app.get('/get-user', async (c) => {
        c.header('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN);
        c.header('Access-Control-Allow-Credentials', 'true');
        const { user } = c.req.query() as { user: string };
        if (!user) {
            c.status(400);
            return c.json({ success: false, message: 'No user provided' });
        }
        return c.json({ user: client.users.cache.get(user), success: true });
    });
}
