import { ActionRowBuilder, CommandInteraction, GuildMember, StringSelectMenuBuilder, StringSelectMenuInteraction, VoiceBasedChannel } from 'discord.js';
import { player } from '../index';
import { fetchSongNamesFromLastFM } from '../utils/fetchSongNamesFromLastFM';
import { playlinks } from '../utils/fetchPlaylinks';

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

        try {
            const member = interaction.member as GuildMember;
            const voiceChannel = member.voice.channel as VoiceBasedChannel;

            if (!voiceChannel) {
                return interaction.reply({ content: 'You need to be in a voice channel to play music!', ephemeral: true });
            }
            await interaction.reply({ content: `Now playing`, ephemeral: true });
            await player.play(voiceChannel, link, { requestedBy: interaction.user.id });

        } catch (error) {
            console.error('Error handling the song selection:', error);
            await interaction.reply({ content: 'There was an error processing your selection.', ephemeral: true });
        }
    }
}
