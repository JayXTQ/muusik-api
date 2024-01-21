import { player, updates, updatesTimeout } from '..';

export function audioTrackAdd() {
    player.events.on('audioTrackAdd', (queue, track) => {
        const queueUpdates = updates.get(queue.guild.id);
        updates.set(queue.guild.id, {
            track: queueUpdates?.track || false,
            volume: queueUpdates?.volume || false,
            queue: true,
            paused: queueUpdates?.paused || false,
        });
        clearTimeout(updatesTimeout.get(queue.guild.id)!);
        updatesTimeout.set(queue.guild.id, setTimeout(() => {
            updates.delete(queue.guild.id);
        }, 10000));
    });
}