import { CommandInteraction, EmbedBuilder, GuildMember, VoiceBasedChannel } from 'discord.js';
import { player } from '..';
import { colors } from '../types';

export const currentlyplayingCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'currentlyplaying') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('You need to be in a voice channel to see what\'s playing!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const node = player.nodes.get(voiceChannel.guild.id);
        const currentTrack = node?.currentTrack;
        if (!currentTrack) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('No music is currently playing in this server.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        let embed = new EmbedBuilder()
            .setTitle('Currently playing')
            .setDescription(`[${currentTrack.title} by ${currentTrack.author}](${currentTrack.url}) requested by ${currentTrack.requestedBy}`)
            .setColor(colors.Muusik);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
