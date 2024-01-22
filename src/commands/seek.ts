import { CommandInteraction, EmbedBuilder, GuildMember, VoiceBasedChannel } from 'discord.js';
import { player } from '..';
import { colors } from '../types';

export const seekCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'seek') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(colors.Error).setDescription('You need to be in a voice channel to seek a track.')], ephemeral: true });
        }

        const node = player.nodes.get(voiceChannel.guild.id);
        if (!node || !node.currentTrack) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(colors.Error).setDescription('No music is currently playing in this server.')], ephemeral: true });
        }

        const timeString = interaction.options.get('position')?.value as string;
        if (!timeString) {
            return interaction.reply({ content: 'Please specify a duration to seek to (e.g., 1:27).', ephemeral: true });
        }

        const position = parseTimeToMilliseconds(timeString);


        if (position === null || position > node.node.totalDuration) {
            return interaction.reply({ content: 'Invalid duration or duration exceeds track length.', ephemeral: true });
        }

        // Acknowledge immediately
        await interaction.deferReply({ ephemeral: true });
        console.log(`Current pos: ${node.node.streamTime} | Seeking to ${position}`);

        try {
            const seekSuccessful = await node.node.seek(position);
            if (seekSuccessful) {
                const embed = new EmbedBuilder()
                    .setColor(colors.Muusik)
                    .setDescription(`Seeked to ${formatTime(position)}.`);
                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply({ content: 'Failed to seek the track.' });
            }
        } catch (error) {
            console.error('Error seeking the track:', error);
            await interaction.editReply({ content: 'Failed to seek the track.' });
        }
    }
};

function parseTimeToMilliseconds(timeString: string) {
    const parts = timeString.split(':').map(Number);
    if (parts.length === 2 && parts.every((n: number) => !isNaN(n))) {
        return (parts[0] * 60 + parts[1]) * 1000;
    }
    return null;
}

function formatTime(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}
