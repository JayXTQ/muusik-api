import { Hono } from 'hono';
import axios, { AxiosResponse } from 'axios';
import { Player } from 'discord-player';
import { VoiceStates } from '../types';

export const volume = (app: Hono, player: Player, voiceStates: VoiceStates) => {
    app.get("/volume/:type", async (c) => {
        c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
        c.header("Access-Control-Allow-Credentials", "true");
        let { user, volume } = c.req.query() as { user: string, volume?: string | number };
        let { type } = c.req.param() as { type: string };

        if (!type) {
            return c.json({ success: false, message: "No type provided" }, 400);
        }

        if (!user) {
            return c.json({ success: false, message: "No user provided" }, 400);
        }

        const state = voiceStates.get(user as string);
        if (!state) {
            return c.json({ success: false, message: "User not in a voice channel" }, 404);
        }

        const queue = player.nodes.get(state.guild_id);

        if (!queue) {
            return c.json({ success: false, message: "No queue found" }, 404);
        }

        if (type === "get") {
            return c.json({ volume: queue.node.volume });
        } else if (type === "set") {
            volume = Number(volume);

            if (isNaN(volume)) {
                return c.json({ success: false, message: "Volume is not a number" }, 400);
            }

            if (volume < 0) {
                volume = 0;
            } else if (volume > 100) {
                volume = 100;
            }

            queue.node.setVolume(Number(volume));
            
            return c.json({ success: true });
        } else {
            return c.json({ success: false, message: "Invalid type" }, 400);
        }
    });
};
