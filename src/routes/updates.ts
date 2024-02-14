import { Hono } from 'hono';
import { Updates, VoiceStates } from '../types';

export default function (
    app: Hono,
    voiceStates: VoiceStates,
    updates_: Updates,
) {
    app.get('/updates', async (c) => {
        c.header('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN);
        c.header('Access-Control-Allow-Credentials', 'true');
        let { user } = c.req.query() as { user: string };

        if (!user) {
            return c.json({ success: false, message: 'No user provided' }, 400);
        }

        const state = voiceStates.get(user as string);
        if (!state) {
            return c.json(
                { success: false, message: 'User not in a voice channel' },
                404,
            );
        }

        const updates = updates_.get(state.guild_id);

        if (!updates) {
            return c.json({ success: false, message: 'No updates found' }, 404);
        }

        return c.json({ updates, success: true });
    });
}
