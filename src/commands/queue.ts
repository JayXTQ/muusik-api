import { CommandInteraction, GuildMember, VoiceBasedChannel } from 'discord.js';
import { player } from '..';

export const queueCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'queue') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'You need to be in a voice channel to view the queue!', ephemeral: true });
        }

        const node = player.nodes.get(voiceChannel.guild);
        if (!node) {
            return interaction.reply({ content: 'No music is currently playing in this server.', ephemeral: true });
        }

        const queue = node.tracks.data || [];
        if (queue.length === 0) {
            return interaction.reply({ content: 'The queue is currently empty.', ephemeral: true });
        }

        const queueContent = queue.map((song, index) => `${index + 1}. ${song.title} requested by ${song.requestedBy}`).join('\n');

        await interaction.reply({ content: `Current queue:\n${queueContent}`, ephemeral: true });
    }
};