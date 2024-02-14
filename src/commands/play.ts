import { ActionRowBuilder, CommandInteraction, GuildMember, StringSelectMenuBuilder, StringSelectMenuInteraction, VoiceBasedChannel, EmbedBuilder, Embed } from 'discord.js';
import { player } from '..';
import { default as fetchSongNamesFromLastFM } from '../utils/fetchSongNamesFromLastFM';
import { default as playlinks } from '../utils/fetchPlaylinks';
import axios from 'axios';
import { colors } from '../types';

function spacesToPlus(str: string) {
    return str.replace(/ /g, "+");
}

export default async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'play') {
        const query = interaction.options.get('query')?.value as string;

        if (!query) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('Please provide a search query.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (query.includes("spotify") || query.startsWith(`http${process.env.DEV ? '://localhost:5173' : 's://muusik.app'}/playlist/`)) {
            await handlePlaylist(interaction, query);
        } else {
            const songs = await fetchSongNamesFromLastFM(query);

            const options = songs.slice(0, 25).map((song) => {
                return {
                    label: song.name,
                    description: song.artist,
                    value: song.url.replace("https://www.last.fm/music/", "") as string
                }
            }).filter((song) => song.value.length < 100)

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select-song')
                .setPlaceholder('Select a song')
                .addOptions(options);

            const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(selectMenu);

            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription('Choose a song from the list:');

            await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });
        };
    }
};

export async function handleSelectMenuInteraction(interaction: StringSelectMenuInteraction) {
    if (interaction.customId === 'select-song') {
        const url = `https://www.last.fm/music/${interaction.values[0]}`;
        const links = await playlinks(url);
        const link = links.find((link) => link.includes('spotify')) || links[0] || null;

        if (!link) {
            const errorEmbed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('No playable links found.');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        let songName: string = "";
        let authorName: string = "";
        let songUrl: string = "";

        try {
            await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${process.env.LASTFM_API_KEY}&artist=${spacesToPlus(decodeURIComponent(url).replace("https://www.last.fm/music/", "").split("/")[0])}&track=${spacesToPlus(decodeURIComponent(url).replace("https://www.last.fm/music/", "").split("/")[2])}&format=json`).then((r) => {
                if (r.status !== 200) {
                    songName = 'Unknown';
                }
                songName = `${r.data.track.name}`;
                authorName = r.data.track.artist.name;
                songUrl = r.data.track.url;
            })
        } catch (error: any) {
            songName = 'Unknown';
            authorName = 'Unknown';
        }

        try {
            const member = interaction.member as GuildMember;
            const voiceChannel = member.voice.channel as VoiceBasedChannel;

            if (!voiceChannel) {
                const embed = new EmbedBuilder()
                    .setColor(colors.Error)
                    .setDescription('You need to be in a voice channel to play music!');
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const node = player.nodes.get(voiceChannel.guild.id);
            let queuePosition = 0;
            let currentlyPlaying = node?.currentTrack ? true : false;

            if (node && node.tracks.data.length > 0) {
                queuePosition = node.tracks.data.length;
            }

            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription(currentlyPlaying ? `[${songName} by ${authorName}](${songUrl}) added to queue, position ${queuePosition + 1}` : `Now playing [${songName} by ${authorName}](${songUrl})`);
            await interaction.reply({ embeds: [embed], ephemeral: true });

            await player.play(voiceChannel, link, { requestedBy: interaction.user.id });

        } catch (error) {
            console.error('Error handling the song selection:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('There was an error processing your selection.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}

async function handlePlaylist(interaction: CommandInteraction, playlistUrl: string) {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel as VoiceBasedChannel;

    if (!voiceChannel) {
        const embed = new EmbedBuilder()
            .setColor(colors.Muusik)
            .setDescription('You need to be in a voice channel to play music!');
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const skippedTracks = [];

    try {
        if (playlistUrl.startsWith(`http${process.env.DEV ? '://localhost:5173' : 's://muusik.app'}/playlist/`)) {
            const data = await axios.get(`${playlistUrl}/data`);
            const tracks = data.data.songs;

            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription(`Playing muusik playlist: ${playlistUrl}`);

            await interaction.reply({ embeds: [embed], ephemeral: true });

            for (const track of tracks) {
                try {
                    await player.play(voiceChannel, track.url, { requestedBy: interaction.user.id });
                } catch (error) {
                    console.error('Error playing track:', track.url, error);
                    skippedTracks.push(`[${track.metadata.name}, ${track.metadata.artist}](<${track.url}>)`);
                }
            }
        } else if (playlistUrl.includes('spotify.com/playlist/')) {
            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription(`Playing Spotify playlist: ${playlistUrl}`);

            await interaction.reply({ embeds: [embed], ephemeral: true });
            try {
                await player.play(voiceChannel, playlistUrl, { requestedBy: interaction.user.id });
            } catch (error) {
                console.error('Error playing Spotify playlist:', error);
                const embed = new EmbedBuilder()
                    .setColor(colors.Error)
                    .setDescription('There was an error playing the Spotify playlist.');
                await interaction.followUp({ embeds: [embed], ephemeral: true });
            }
        } else {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription(`Invalid playlist URL: ${playlistUrl}`);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (skippedTracks.length > 0) {
            const skippedTracksEmbed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription(`Playlist processed. Skipped tracks:\n${skippedTracks.join('\n')}`);
            await interaction.followUp({ embeds: [skippedTracksEmbed], ephemeral: true });
        }
    } catch (error) {
        console.error('Error playing the playlist:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor(colors.Error)
            .setDescription('There was an error processing the playlist.');
        await interaction.editReply({ embeds: [errorEmbed] });
    }
}