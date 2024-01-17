import { CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction } from 'discord.js';
import { Command, colors } from '../types';
import * as fs from 'fs';
import * as path from 'path';

const ITEMS_PER_PAGE = 8;

export const helpCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === "help") {
        const commandsFilePath = path.join(__dirname, '../../commands.json');
        const commands: Command[] = JSON.parse(fs.readFileSync(commandsFilePath, 'utf8'));

        const totalPages = Math.ceil(commands.length / ITEMS_PER_PAGE);

        const fields = commands.slice(0, ITEMS_PER_PAGE).map((cmd: Command) => ({
            name: `/${cmd.name}`,
            value: cmd.description
        }));

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous_page')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('next_page')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(totalPages <= 1)
            );

        interaction.reply({
            embeds: [
                {
                    title: `muusik.app Commands`,
                    description: `Here are the commands you can use with the muusik.app bot:`,
                    color: colors.Muusik,
                    fields: fields,
                    footer: { text: `Page 1 of ${totalPages}` }
                }
            ],
            components: [row],
            ephemeral: true
        });
    }
};

export async function handleHelpCommandPagination(interaction: ButtonInteraction) {
    const currentPage = parseInt(interaction.message.embeds[0].footer?.text.split(' ')[1] ?? '');
    const totalPages = parseInt(interaction.message.embeds[0].footer?.text.split(' ')[3] ?? '');
    let newPage = interaction.customId === 'next_page' ? currentPage + 1 : currentPage - 1;

    newPage = Math.max(1, Math.min(newPage, totalPages));

    const commandsFilePath = path.join(__dirname, '../../commands.json');
    const commands: Command[] = JSON.parse(fs.readFileSync(commandsFilePath, 'utf8'));

    const fields = commands.slice((newPage - 1) * ITEMS_PER_PAGE, newPage * ITEMS_PER_PAGE).map((cmd: Command) => ({
        name: `/${cmd.name}`,
        value: cmd.description
    }));

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous_page')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(newPage === 1),
            new ButtonBuilder()
                .setCustomId('next_page')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(newPage === totalPages)
        );

    await interaction.update({
        embeds: [
            {
                title: `muusik.app Commands`,
                description: `Here are the commands you can use with the muusik.app bot:`,
                color: colors.Muusik,
                fields: fields,
                footer: { text: `Page ${newPage} of ${totalPages}` }
            }
        ],
        components: [row]
    });
}
