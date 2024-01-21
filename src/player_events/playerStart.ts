import { player, updates } from '..';

export function playerStart() {
    player.events.on('playerStart', (queue, track) => {
        const queueUpdates = updates.get(queue.guild.id);
        updates.set(queue.guild.id, {
            track: true,
            volume: queueUpdates?.volume || false,
            queue: queueUpdates?.queue || false,
            paused: queueUpdates?.paused || false,
        });
        setTimeout(() => {
            updates.delete(queue.guild.id);
        }, 10000);
    });
}