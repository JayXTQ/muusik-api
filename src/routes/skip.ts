import { Hono } from 'hono';
import { Client, VoiceBasedChannel } from "discord.js";

export const skip = (app: Hono, client: Client, voiceStates: Map<string, { guild_id: string; channel_id: string }>, player: any) => {
    app.post("/skip", async (c) => {
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
        queue.node.skip();
        c.status(200);
        return c.json({ success: true });
    });
};
