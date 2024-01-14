import { Hono } from 'hono';
import { Client, Guild, Role } from 'discord.js';

function checkIfPermission(
    permissions: number | string,
    permission: number | string,
): boolean {
    permissions = typeof permissions === "string" ? parseInt(permissions) : permissions;
    permission = typeof permission === "string" ? parseInt(permission) : permission;
    return (permissions & permission) === permission;
}


export const check_permissions = (app: Hono, client: Client) => {
    app.get("/check-permissions", async (c) => {
        c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
        c.header("Access-Control-Allow-Credentials", "true");
        const { guild, user, permission } = c.req.query() as { guild: string, user: string, permission: string };
        if (!guild || !user) {
            c.status(400);
            return c.json({ success: false, message: "No guild or user provided" });
        }

        const member = await client.guilds.cache.get(guild)?.members.fetch(user);
        if (!member) {
            c.status(404);
            return c.json({ success: false, message: "Member not found" });
        }

        let hasPermission = false;
        for (let role of member.roles.cache.keys() as unknown as Role[] | string[]) {
            role = (client.guilds.cache.get(guild) as Guild).roles.cache.find(r => r.id === role) as Role;
            if (role && checkIfPermission(role.permissions.toString(), permission)) {
                hasPermission = true;
                break;
            }
        }

        if (!hasPermission) {
            c.status(403);
            return c.json({ success: false, message: "Member does not have permission" });
        }

        c.status(200);
        return c.json({ success: true });
    });
};
