import { Interaction, StringSelectMenuInteraction, GuildMember } from 'discord.js';
import { CommandHandlers as CommandHandlersType } from '../types';
import * as CommandHandlers from '../commands';
import { handleSelectMenuInteraction } from '../commands/play';

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
        } else if (interaction.isStringSelectMenu()) {
            await handleSelectMenuInteraction(interaction as StringSelectMenuInteraction);
        }
        // Add other interaction types when needed
    },
};
