import { player, updates, updatesTimeout } from '..';

export default function () {
    player.events.on('playerPause', (queue) => {
        const queueUpdates = updates.get(queue.guild.id);
        updates.set(queue.guild.id, {
            track: queueUpdates?.track || false,
            volume: queueUpdates?.volume || false,
            queue: queueUpdates?.queue || false,
            paused: true,
        });
        clearTimeout(updatesTimeout.get(queue.guild.id)!);
        updatesTimeout.set(queue.guild.id, setTimeout(() => {
            updates.delete(queue.guild.id);
        }, 10000));
    });
}