import { Hono } from 'hono';
import { Client, VoiceBasedChannel } from "discord.js";

export const findUser = (app: Hono, client: Client, voiceStates: Map<string, { guild_id: string; channel_id: string }>) => {
    app.get("/find-user", async (c) => {
        c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
        c.header("Access-Control-Allow-Credentials", "true");
        const { user } = c.req.query();
        if (!user) {
            c.status(400);
            return c.json({ success: false, message: "No user provided" });
        }
        let channel;
        try {
            const channel_ = voiceStates.get(user);
            if (!channel_) {
                c.status(404);
                return c.json({
                    success: false,
                    message: "User not in a voice channel",
                });
            }
            channel = client.channels.cache.get(channel_.channel_id);
            if(!channel) {
                c.status(404);
                return c.json({
                    success: false,
                    message: "Can not find channel",
                });
            }
            c.status(200);
            return c.json({ channel, success: true });
        } catch (_) {
            c.status(404);
            return c.json({
                success: false,
                message: "User not in a voice channel",
            });
        }
    });
};