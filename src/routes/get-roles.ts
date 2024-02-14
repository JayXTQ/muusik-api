import { Hono } from 'hono';
import { Client, Guild } from 'discord.js';

export default function (app: Hono, client: Client) {
    app.get('/get-roles', (c) => {
        c.header('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN);
        c.header('Access-Control-Allow-Credentials', 'true');

        const { guild } = c.req.query();
        if (!guild) {
            c.status(400);
            return c.json({ success: false, message: 'No guild provided' });
        }
        const roles = (
            client.guilds.cache.get(guild) as Guild
        )?.roles.cache.map((role) => ({
            id: role.id,
            name: role.name,
            color: role.hexColor,
            permissions: role.permissions.bitfield,
        }));
        if (!roles) {
            c.status(404);
            return c.json({ success: false, message: 'No roles found' });
        }
        c.status(200);
        return c.json({ success: true, roles });
    });
}
