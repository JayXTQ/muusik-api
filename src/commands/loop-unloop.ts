import {
    CommandInteraction,
    GuildMember,
    VoiceBasedChannel,
    EmbedBuilder,
    ChatInputCommandInteraction,
} from 'discord.js';
import { player } from '..';
import { colors } from '../types';

export default async (interaction: ChatInputCommandInteraction) => {
    if (interaction.commandName === 'loop') {
        const subcommand = interaction.options.getSubcommand();

        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription(
                    'You need to be in a voice channel to loop the music.',
                );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const node = player.nodes.get(voiceChannel.guild.id);
        if (!node || !node.currentTrack) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription(
                    'No music is currently playing in this server.',
                );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        let loopStatus;
        switch (subcommand) {
            case 'current':
                node.setRepeatMode(1);
                loopStatus = 'Looping current track';
                break;
            case 'queue':
                node.setRepeatMode(2);
                loopStatus = 'Looping queue';
                break;
            case 'off':
                node.setRepeatMode(0);
                loopStatus = 'Looping disabled';
                break;
            default:
                return interaction.reply({
                    content: 'Invalid subcommand',
                    ephemeral: true,
                });
        }

        const embed = new EmbedBuilder()
            .setColor(colors.Muusik)
            .setDescription(loopStatus);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
