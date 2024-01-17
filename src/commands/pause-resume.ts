import { CommandInteraction, GuildMember, VoiceBasedChannel, EmbedBuilder } from 'discord.js';
import { player } from '..';
import { colors } from '../types';

export const pauseCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'pause') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription('You need to be in a voice channel to pause the music!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const node = player.nodes.get(voiceChannel.guild);
        if (!node || !node.player) {
            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription('No music is currently playing in this server.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (node.node.isPlaying()) {
            node.node.setPaused(true);
            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription('Music playback paused.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            node.node.setPaused(false);
            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription('Music playback resumed.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};

export const resumeCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'resume') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription('You need to be in a voice channel to resume the music!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const node = player.nodes.get(voiceChannel.guild);
        if (!node || !node.player) {
            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription('No music is currently playing in this server.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (node.node.isPaused()) {
            node.node.setPaused(false);
            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription('Music playback resumed.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription('Music is already playing.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};