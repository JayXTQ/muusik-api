import { Interaction, AutocompleteInteraction } from 'discord.js';
import { CommandHandlers as CommandHandlersType } from '../types';
import * as CommandHandlers from '../commands';
import axios from 'axios';

export const interactionManager = {
    handleInteraction: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            const { commandName } = interaction;
            const handler = (CommandHandlers as unknown as CommandHandlersType)[`${commandName}Command`];

            if (handler) {
                await handler(interaction);
            } else {
                console.log(`No handler for command: ${commandName}`);
                await interaction.reply({ content: `Command not found.\nNo handler for command: ${commandName}`, ephemeral: true });
            }
        } else if (interaction.isAutocomplete()) {
            await handleAutocompleteInteraction(interaction as AutocompleteInteraction);
        }
        // Add other interaction types when needed
    },
};

async function handleAutocompleteInteraction(interaction: AutocompleteInteraction) {
    if (interaction.commandName === 'play') {
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.name === 'song') {
            const searchQuery = focusedOption.value;
            const songNames = await fetchSongNamesFromLastFM(searchQuery);

            // Limit the number of responses to 25 cuz discord silly
            const limitedSongNames = songNames.slice(0, 25);

            await interaction.respond(
                limitedSongNames.map(song => ({ name: song, value: song }))
            );
        }
    }
}

async function fetchSongNamesFromLastFM(query: string): Promise<string[]> {
    try {
        const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${process.env.LASTFM_API_KEY}&format=json`);
        if (response.data.results && response.data.results.trackmatches && response.data.results.trackmatches.track) {
            const tracks = response.data.results.trackmatches.track;
            return tracks.map((track: any) => `${track.name} by ${track.artist}`);
        } else {
            // Handle case where trackmatches is not present or the structure is different
            console.log('Unexpected response structure:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching songs from LASTFM:', error);
        return [];
    }
}
