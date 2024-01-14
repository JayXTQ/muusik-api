import { Hono } from 'hono';
import { Client, VoiceBasedChannel } from "discord.js";

export const playlist = (app: Hono, client: Client, voiceStates: Map<string, { guild_id: string; channel_id: string }>, player: any) => {
    app.post("/playlist", async (c) => {
        c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
        c.header("Access-Control-Allow-Credentials", "true");

        const { url, user } = await c.req.json() as { url: string; user: string };
        if (!url || !user) {
            c.status(400);
            return c.json({ success: false, message: "No url or user provided" });
        }
        const state = voiceStates.get(user as string);
        if (!state) {
            c.status(404);
            return c.json({ success: false, message: "User not in a voice channel" });
        }
        const channel = client.channels.cache.get(state.channel_id) as VoiceBasedChannel;
        let validUrl = url.includes("spotify") || url.includes("apple") ? true : false;
        if (!validUrl) {
            c.status(400);
            return c.json({ success: false, message: "Invalid url" });
        }
        try {
            await player.play(channel, url, { requestedBy: user });
        } catch (e) {
            console.log(e);
            c.status(500);
            return c.json({ success: false, message: "Error playing playlist" });
        }
        c.status(200);
        return c.json({ success: true });
    });
};
