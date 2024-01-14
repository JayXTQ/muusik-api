import { Interaction } from 'discord.js';
import { CommandHandlers as CommandHandlersType } from '../types';
import * as CommandHandlers from '../commands';

export const interactionManager = {
    handleInteraction: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            const { commandName } = interaction;
            const handler = (CommandHandlers as CommandHandlersType)[`${commandName}Command`];

            if (handler) {
                await handler(interaction);
            } else {
                console.log(`No handler for command: ${commandName}`);
                await interaction.reply({ content: `Command not found.\nNo handler for command: ${commandName}`, ephemeral: true });
            }
        }
    },
};