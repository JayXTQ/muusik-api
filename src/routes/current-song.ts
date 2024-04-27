import { Hono } from 'hono';
import { Client, VoiceBasedChannel } from 'discord.js';
import { LrcSearchResult, Player } from 'discord-player';

export default function (
    app: Hono,
    client: Client,
    voiceStates: Map<string, { guild_id: string; channel_id: string }>,
    player: Player,
) {
    app.get('/current-song', async (c) => {
        c.header('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN);
        c.header('Access-Control-Allow-Credentials', 'true');
        const { user } = c.req.query() as { user: string };
        if (!user) {
            c.status(400);
            return c.json({ success: false, message: 'No user provided' });
        }
        const state = voiceStates.get(user as string);
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
        const queue = player.nodes.get(channel.guild);
        if (!queue) {
            c.status(404);
            return c.json({ success: false, message: 'No queue found' });
        }
        const currentTrackTimeElapsed =
            queue.node.getTimestamp()?.current.value || 0;
        let trackLyrics: LrcSearchResult[] | string = await player.lyrics
            .search( {
                q: `${queue.currentTrack?.title} ${queue.currentTrack?.author}`,
            }
            );
        trackLyrics = trackLyrics[0]?.plainLyrics || 'No lyrics found';
        return c.json({
            song: queue.currentTrack,
            currentTrackTimeElapsed,
            trackLyrics,
            success: true,
        });
    });
}
