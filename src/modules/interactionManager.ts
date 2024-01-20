import { Interaction, StringSelectMenuInteraction, ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
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
        } else if (interaction.isButton()) {
            const buttonInteraction = interaction as ButtonInteraction;
            switch (buttonInteraction.customId) {
                case 'previous_queue_page':
                case 'next_queue_page':
                    await CommandHandlers.handleQueuePagination(buttonInteraction);
                    break;
                case 'previous_page':
                case 'next_page':
                    await CommandHandlers.handleHelpCommandPagination(buttonInteraction);
                    break;
                case 'volume_down_10':
                case 'volume_down_5':
                case 'volume_up_5':
                case 'volume_up_10':
                case 'open_volume_modal':
                    await CommandHandlers.handleVolumeButton(buttonInteraction);
                    break;
                // Add other button interaction cases as needed
            }
        } else if (interaction.isModalSubmit()) {
            const modalSubmitInteraction = interaction as ModalSubmitInteraction;
            if (modalSubmitInteraction.customId === 'custom_volume_modal') {
                await CommandHandlers.handleVolumeModal(modalSubmitInteraction);
            }
            // Add other modal submit interaction cases as needed
        } else if (interaction.isStringSelectMenu()) {
            await CommandHandlers.handleSelectMenuInteraction(interaction as StringSelectMenuInteraction);
        }
        // Add other interaction types when needed
    },
};
