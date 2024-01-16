import { ActionRowBuilder, CommandInteraction, GuildMember, StringSelectMenuBuilder, StringSelectMenuInteraction, VoiceBasedChannel } from 'discord.js';
import { player } from '..';
import { fetchSongNamesFromLastFM } from '../utils/fetchSongNamesFromLastFM';
import { playlinks } from '../utils/fetchPlaylinks';
import axios from 'axios';

function spacesToPlus(str: string) {
    return str.replace(/ /g, "+");
}

export const playCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'play') {
        const query = interaction.options.get('query')?.value as string;

        if (!query) {
            return interaction.reply({ content: 'Please provide a search query.', ephemeral: true });
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

            await interaction.reply({
                content: 'Choose a song from the list:',
                components: [row],
                ephemeral: true
            });
        }
    };
};

export async function handleSelectMenuInteraction(interaction: StringSelectMenuInteraction) {
    if (interaction.customId === 'select-song') {
        const url = `https://www.last.fm/music/${interaction.values[0]}`;
        const links = await playlinks(url);
        const link = links.find((link) => link.includes('spotify')) || links[0] || null;

        if (!link) {
            return interaction.reply({ content: 'No playable links found.', ephemeral: true });
        }

        let songName: string = "";

        try {
            await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${process.env.LASTFM_API_KEY}&artist=${spacesToPlus(decodeURIComponent(url).replace("https://www.last.fm/music/", "").split("/")[0])}&track=${spacesToPlus(decodeURIComponent(url).replace("https://www.last.fm/music/", "").split("/")[2])}&format=json`).then((r) => {
                if (r.status !== 200) {
                    songName = 'Unknown';
                }
                songName = `${r.data.track.name} by ${r.data.track.artist.name}`;
            })
        } catch (error: any) {
            songName = 'Unknown';
        }

        try {
            const member = interaction.member as GuildMember;
            const voiceChannel = member.voice.channel as VoiceBasedChannel;

            if (!voiceChannel) {
                return interaction.reply({ content: 'You need to be in a voice channel to play music!', ephemeral: true });
            }

            const node = player.nodes.get(voiceChannel.guild.id);
            let isQueueEmpty = true;
            if (node && node.tracks.data.length > 0) {
                isQueueEmpty = false;
            }

            await player.play(voiceChannel, link, { requestedBy: interaction.user.id });

            if (isQueueEmpty) {
                await interaction.reply({ content: `Now playing ${songName}`, ephemeral: true });
            } else {
                const queuePosition = node?.tracks.data.length;
                await interaction.reply({ content: `${songName} added to queue, position ${queuePosition}`, ephemeral: true });
            }

        } catch (error) {
            console.error('Error handling the song selection:', error);
            await interaction.reply({ content: 'There was an error processing your selection.', ephemeral: true });
        }
    }
}

async function handlePlaylist(interaction: CommandInteraction, playlistUrl: string) {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel as VoiceBasedChannel;

    if (!voiceChannel) {
        return interaction.reply({ content: 'You need to be in a voice channel to play a playlist!', ephemeral: true });
    }

    const skippedTracks = [];

    try {
        if (playlistUrl.startsWith(`http${process.env.DEV ? '://localhost:5173' : 's://muusik.app'}/playlist/`)) {
            const data = await axios.get(`${playlistUrl}/data`);
            const tracks = data.data.songs;

            await interaction.reply({ content: `Playing muusik playlist: ${playlistUrl}`, ephemeral: true });

            for (const track of tracks) {
                try {
                    await player.play(voiceChannel, track.url, { requestedBy: interaction.user.id });
                } catch (error) {
                    console.error('Error playing track:', track.url, error);
                    skippedTracks.push(`[${track.metadata.name}, ${track.metadata.artist}](<${track.url}>)`);
                }
            }
        } else if (playlistUrl.includes('spotify.com/playlist/')) {
            await interaction.reply({ content: `Playing Spotify playlist: ${playlistUrl}`, ephemeral: true });
            try {
                await player.play(voiceChannel, playlistUrl, { requestedBy: interaction.user.id });
            } catch (error) {
                console.error('Error playing Spotify playlist:', error);
                await interaction.followUp({ content: 'There was an error playing the Spotify playlist.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'Invalid playlist URL.', ephemeral: true });
        }

        if (skippedTracks.length > 0) {
            await interaction.followUp({
                content: `Playlist processed. Skipped tracks:\n${skippedTracks.join('\n')}`,
                ephemeral: true
            });
        }
    } catch (error) {
        console.error('Error playing the playlist:', error);
        await interaction.editReply({ content: 'There was an error processing the playlist.' });
    }
}
