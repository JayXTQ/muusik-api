import { Interaction, StringSelectMenuInteraction, GuildMember, ButtonInteraction } from 'discord.js';
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
            await CommandHandlers.handleQueuePagination(interaction as ButtonInteraction);
        }
        // Add other interaction types when needed
    },
};
