import { Hono } from 'hono';
import { Client } from "discord.js";

export const get_owner = (app: Hono, client: Client, voiceStates: Map<string, { guild_id: string; channel_id: string }>) => {
    app.get("/get-owner", async (c) => {
        c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
        c.header("Access-Control-Allow-Credentials", "true");
        const { user } = c.req.query() as { user: string };
        if (!user) {
            c.status(400);
            return c.json({ success: false, message: "No user provided" });
        }
        const guilduser = voiceStates.get(user);
        if (!guilduser) {
            c.status(404);
            return c.json({
                success: false,
                message: "User not in a voice channel",
            });
        }
        const guild = client.guilds.cache.get(guilduser.guild_id)
        if(!guild) {
            c.status(404);
            return c.json({ success: false, message: 'Guild not found / not cached'})
        }
        const owner = guild.ownerId
        return c.json({ owner, guild: guild.id, success: true });
    });
};
