import { Hono } from 'hono';
import { Client, VoiceBasedChannel } from "discord.js";
import { Player } from 'discord-player';
import axios from 'axios';

export default function (app: Hono, client: Client, voiceStates: Map<string, { guild_id: string; channel_id: string }>, player: Player, dev: boolean) {
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
        let validUrl = url.includes("spotify") || url.startsWith(`http${dev ? '://localhost:5173' : 's://muusik.app'}/playlist/`);
        if (!validUrl) {
            c.status(400);
            return c.json({ success: false, message: "Invalid url" });
        }
        try {
            if(url.startsWith(`http${dev ? '://localhost:5173' : 's://muusik.app'}/playlist/`)) {
                const data = await axios.get(url+"/data");
                const tracks = (data.data as {
                    id: string;
                    created_at: string;
                    name: string;
                    songs: Array<{
                        url: string;
                        metadata: {
                            name: string;
                            artist: string;
                            duration: string;
                            image: string;
                        }
                    }>;
                    owner: string[];
                }).songs;
                for(const track of tracks) {
                    await player.play(channel, track.url, { requestedBy: user });
                }
            } else {
                await player.play(channel, url, { requestedBy: user });
            }
        } catch (e) {
            console.log(e);
            c.status(500);
            return c.json({ success: false, message: "Error playing playlist" });
        }
        c.status(200);
        return c.json({ success: true });
    });
};
