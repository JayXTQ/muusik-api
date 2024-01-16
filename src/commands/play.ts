import { ActionRowBuilder, CommandInteraction, GuildMember, StringSelectMenuBuilder, StringSelectMenuInteraction, VoiceBasedChannel } from 'discord.js';
import { player } from '../index';
import { fetchSongNamesFromLastFM } from '../utils/fetchSongNamesFromLastFM';

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
                value: `${song.name} by ${song.artist}`
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
        const selectedSong = interaction.values[0];
        const [songName, artist] = selectedSong.split(" by ").map(part => part.trim());

        try {
            const member = interaction.member as GuildMember;
            const voiceChannel = member.voice.channel as VoiceBasedChannel;

            if (!voiceChannel) {
                return interaction.reply({ content: 'You need to be in a voice channel to play music!', ephemeral: true });
            }

            let node = player.nodes.get(voiceChannel.guild);
            if (!node) {
                await interaction.reply({ content: `Now playing ${songName} by ${artist}`, ephemeral: true });
                await player.play(voiceChannel, songName, { requestedBy: interaction.user.id });
            } else {
                node.play(songName, { requestedBy: interaction.user.id });
            }

        } catch (error) {
            console.error('Error handling the song selection:', error);
            await interaction.reply({ content: 'There was an error processing your selection.', ephemeral: true });
        }
    }
}
