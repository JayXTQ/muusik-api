import { Hono } from 'hono';
import { Client, VoiceBasedChannel } from "discord.js";

export const current_song = (app: Hono, client: Client, voiceStates: Map<string, { guild_id: string; channel_id: string }>, player: any) => {
    app.get("/current-song", async (c) => {
        c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
        c.header("Access-Control-Allow-Credentials", "true");
        const { user } = c.req.query() as { user: string };
        if (!user) {
            c.status(400);
            return c.json({ success: false, message: "No user provided" });
        }
        const state = voiceStates.get(user as string);
        if (!state) {
            c.status(404);
            return c.json({ success: false, message: "User not in a voice channel" });
        }
        const channel = client.channels.cache.get(state.channel_id) as VoiceBasedChannel;
        const queue = player.nodes.get(channel.guild);
        if (!queue) {
            c.status(404);
            return c.json({ success: false, message: "No queue found" });
        }
        const currentTrackTimeElapsed = queue.node.estimatedPlaybackTime;
        return c.json({ song: queue.currentTrack, currentTrackTimeElapsed, success: true });
    });
};