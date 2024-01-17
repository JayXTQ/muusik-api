import { CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { player } from '..';
import { colors } from '../types';

export const stopCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'stop') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('You need to be in a voice channel to stop the music!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const node = player.nodes.get(interaction.guildId!);
        if (!node) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('No music is currently playing in this server.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        node.node.stop();

        const connection = getVoiceConnection(interaction.guildId!);
        connection?.destroy();

        const embed = new EmbedBuilder()
            .setColor(colors.Muusik)
            .setDescription('Stopped the music and left the voice channel.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
