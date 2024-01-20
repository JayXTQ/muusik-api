import { player, updates } from '..';

export function volumeChange() {
    player.events.on('volumeChange', (queue, volume) => {
        const queueUpdates = updates.get(queue.guild.id);
        updates.set(queue.guild.id, {
            track: queueUpdates?.track || false,
            volume: true,
            queue: queueUpdates?.queue || false,
            paused: queueUpdates?.paused || false,
        });
        setTimeout(() => {
            updates.delete(queue.guild.id);
        }, 10000);
    });
}