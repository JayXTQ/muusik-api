import { CommandInteraction, GuildMember, VoiceBasedChannel, EmbedBuilder } from 'discord.js';
import { player } from '..';
import { colors } from '../types';

export const shuffleCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'shuffle') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('You need to be in a voice channel to shuffle the music.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const node = player.nodes.get(voiceChannel.guild.id);
        if (!node || !node.currentTrack) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('No music is currently playing in this server.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!node.tracks.data || node.tracks.data.length <= 1) {
            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription('There are not enough songs in the queue to shuffle.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        node.tracks.shuffle();

        const embed = new EmbedBuilder()
            .setColor(colors.Muusik)
            .setDescription('The queue has been shuffled.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
