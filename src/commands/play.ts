import { ActionRowBuilder, CommandInteraction, GuildMember, StringSelectMenuBuilder, StringSelectMenuInteraction, VoiceBasedChannel } from 'discord.js';
import { player } from '../index';
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

        const songs = await fetchSongNamesFromLastFM(query);

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select-song')
            .setPlaceholder('Select a song')
            .addOptions(songs.slice(0, 25).map((song) => ({
                label: song.name,
                description: song.artist,
                value: song.url
            })));

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        await interaction.reply({
            content: 'Choose a song from the list:',
            components: [row],
            ephemeral: true
        });
    }
};

export async function handleSelectMenuInteraction(interaction: StringSelectMenuInteraction) {
    if (interaction.customId === 'select-song') {
        const links = await playlinks(interaction.values[0]);
        const link = links.find((link) => link.includes('spotify')) || links[0] || null;

        if (!link) {
            return interaction.reply({ content: 'No playable links found.', ephemeral: true });
        }

        let songName: string = "";

        try {
            await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${process.env.LASTFM_API_KEY}&artist=${spacesToPlus(decodeURIComponent(interaction.values[0]).replace("https://www.last.fm/music/", "").split("/")[0])}&track=${spacesToPlus(decodeURIComponent(interaction.values[0]).replace("https://www.last.fm/music/", "").split("/")[2])}&format=json`).then((r) => {
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
            await interaction.reply({ content: `Now playing ${songName}`, ephemeral: true });
            await player.play(voiceChannel, link, { requestedBy: interaction.user.id });

        } catch (error) {
            console.error('Error handling the song selection:', error);
            await interaction.reply({ content: 'There was an error processing your selection.', ephemeral: true });
        }
    }
}
