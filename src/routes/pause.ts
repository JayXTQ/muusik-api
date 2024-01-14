import { Hono } from 'hono';
import { Client, VoiceBasedChannel } from "discord.js";
import { Player } from 'discord-player';

export const pause = (app: Hono, client: Client, voiceStates: Map<string, { guild_id: string; channel_id: string }>, player: Player) => {
    app.post("/pause", async (c) => {
        c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
        c.header("Access-Control-Allow-Credentials", "true");
        const { user } = await c.req.json() as { user: string };
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
        queue.node.setPaused(queue.node.isPlaying());
        c.status(200);
        return c.json({ playing: !queue.node.isPlaying(), success: true });
    });
};
