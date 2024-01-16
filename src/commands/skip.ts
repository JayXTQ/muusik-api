import { CommandInteraction, GuildMember, VoiceBasedChannel, EmbedBuilder } from 'discord.js';
import { player } from '..';
import { colors } from '../types';

export const skipCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'skip') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('You need to be in a voice channel to skip songs!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const node = player.nodes.get(voiceChannel.guild);
        if (!node) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('No music is currently playing in this server.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        node.node.skip();

        const embed = new EmbedBuilder()
            .setColor(colors.Muusik)
            .setDescription('Skipped to the next song.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
