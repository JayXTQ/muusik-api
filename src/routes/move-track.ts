import { Hono } from 'hono';
import { Client, VoiceBasedChannel } from 'discord.js';
import { Player, Track, TrackResolvable } from 'discord-player';
import { Updates, UpdatesTimeout, VoiceStates } from '../types';

export default function (
    app: Hono,
    player: Player,
    voiceStates: VoiceStates,
    updates: Updates,
    updatesTimeout: UpdatesTimeout,
    client: Client,
) {
    app.post('/move-track', async (c) => {
        c.header('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN);
        c.header('Access-Control-Allow-Credentials', 'true');
        let { user, track, location } = (await c.req.json()) as {
            user: string;
            track: string | number | TrackResolvable | Track;
            location: string | number;
        };
        if (!user) {
            c.status(400);
            return c.json({ success: false, message: 'No user provided' });
        }
        if (!track) {
            c.status(400);
            return c.json({ success: false, message: 'No track provided' });
        }
        if (!location) {
            c.status(400);
            return c.json({ success: false, message: 'No location provided' });
        }
        location = Number(location);
        if (isNaN(location)) {
            c.status(400);
            return c.json({ success: false, message: 'Invalid location' });
        }
        const state = voiceStates.get(user);
        if (!state) {
            c.status(404);
            return c.json({
                success: false,
                message: 'User not in a voice channel',
            });
        }
        const channel = client.channels.cache.get(
            state.channel_id,
        ) as VoiceBasedChannel;
        const node = player.nodes.get(channel.guild);
        if (!node) {
            c.status(500);
            return c.json({ success: false, message: 'No queue found' });
        }
        track = Number(track);
        if (isNaN(track)) {
            c.status(400);
            return c.json({ success: false, message: 'Invalid track' });
        }
        track = node.tracks.data[track];
        if (!track) {
            c.status(404);
            return c.json({ success: false, message: 'Track not found' });
        }
        if (location < 0) {
            location = 0;
        }
        if (location > node.tracks.data.length) {
            location = node.tracks.data.length;
        }
        node.node.move(track, location);
        const current = updates.get(channel.guild.id);
        updates.set(node.guild.id, {
            track: current?.track || false,
            volume: current?.volume || false,
            queue: true,
            paused: current?.paused || false,
        });
        clearTimeout(updatesTimeout.get(node.guild.id)!);
        updatesTimeout.set(
            node.guild.id,
            setTimeout(() => {
                updates.delete(node.guild.id);
            }, 10000),
        );
        return c.json({ success: true });
    });
}
