import { player, updates } from '..';

export function audioTrackAdd() {
    player.events.on('audioTrackAdd', (queue, track) => {
        const queueUpdates = updates.get(queue.guild.id);
        updates.set(queue.guild.id, {
            track: queueUpdates?.track || false,
            volume: queueUpdates?.volume || false,
            queue: true,
            paused: queueUpdates?.paused || false,
        });
        setTimeout(() => {
            updates.delete(queue.guild.id);
        }, 10000);
    });
}