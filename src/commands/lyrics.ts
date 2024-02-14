import { CommandInteraction, EmbedBuilder, GuildMember, VoiceBasedChannel } from 'discord.js';
import { player } from '..';
import { lyricsExtractor } from '@discord-player/extractor';
import { colors } from '../types';

const lyricsClient = lyricsExtractor(); // optional API key here :3

export default async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'lyrics') {
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

        lyricsClient
            .search(`${currentTrack.title} ${currentTrack.author}`)
            .then((lyrics) => {
                const embed = new EmbedBuilder()
                    .setTitle(`${currentTrack.title} by ${currentTrack.author}`)
                    .setURL(currentTrack.url)
                    .setDescription(lyrics?.lyrics ?? 'No lyrics found.')
                    .setColor(colors.Muusik);

                interaction.reply({ embeds: [embed], ephemeral: true });
            })
            .catch(() => {
                const embed = new EmbedBuilder()
                    .setTitle(`Lyrics for: ${currentTrack.title}`)
                    .setDescription('No lyrics found.')
                    .setColor(colors.Error);

                interaction.reply({ embeds: [embed], ephemeral: true });
            });
    }
};