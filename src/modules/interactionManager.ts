import { Interaction, StringSelectMenuInteraction, ButtonInteraction } from 'discord.js';
import { CommandHandlers as CommandHandlersType, colors } from '../types';
import * as CommandHandlers from '../commands';

export const interactionManager = {
    handleInteraction: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            const { commandName } = interaction;
            const handler = (CommandHandlers as unknown as CommandHandlersType)[`${commandName}Command`];

            if (handler) {
                await handler(interaction);
            } else {
                console.log(`No handler for command: ${commandName}`);
                const errorEmbed = {
                    title: 'Error',
                    description: `Command not found.\nNo handler for command: ${commandName}`,
                    color: colors.Error,
                };
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        } else if (interaction.isStringSelectMenu()) {
            await CommandHandlers.handleSelectMenuInteraction(interaction as StringSelectMenuInteraction);
        } else if (interaction.isButton()) {
            const buttonInteraction = interaction as ButtonInteraction;
            if (buttonInteraction.customId === 'previous_queue_page' || buttonInteraction.customId === 'next_queue_page') {
                await CommandHandlers.handleQueuePagination(buttonInteraction);
            } else if (buttonInteraction.customId === 'previous_page' || buttonInteraction.customId === 'next_page') {
                await CommandHandlers.handleHelpCommandPagination(buttonInteraction);
            }
            // Add other button interactions when needed
        }
        // Add other interaction types when needed
    },
};
