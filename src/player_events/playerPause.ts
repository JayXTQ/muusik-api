import { player, updates } from '..';

export function playerPause() {
    player.events.on('playerPause', (queue) => {
        const queueUpdates = updates.get(queue.guild.id);
        updates.set(queue.guild.id, {
            track: queueUpdates?.track || false,
            volume: queueUpdates?.volume || false,
            queue: queueUpdates?.queue || false,
            paused: true,
        });
        setTimeout(() => {
            updates.delete(queue.guild.id);
        }, 10000);
    });
}