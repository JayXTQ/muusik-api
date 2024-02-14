import { player, updates, updatesTimeout } from '..';

export default function () {
    player.events.on('volumeChange', (queue, volume) => {
        const queueUpdates = updates.get(queue.guild.id);
        updates.set(queue.guild.id, {
            track: queueUpdates?.track || false,
            volume: true,
            queue: queueUpdates?.queue || false,
            paused: queueUpdates?.paused || false,
        });
        clearTimeout(updatesTimeout.get(queue.guild.id)!);
        updatesTimeout.set(queue.guild.id, setTimeout(() => {
            updates.delete(queue.guild.id);
        }, 10000));
    });
}