import { player, updates } from '..';

export function playerResume() {
    player.events.on('playerResume', (queue) => {
        const queueUpdates = updates.get(queue.guild.id);
        updates.set(queue.guild.id, {
            track: queueUpdates?.track || false,
            volume: queueUpdates?.volume || false,
            queue: queueUpdates?.queue || false,
            paused: false,
        });
        setTimeout(() => {
            updates.delete(queue.guild.id);
        }, 10000);
    });
}