const fs = require('fs');
const path = require('path');
import { CommandInteraction } from 'discord.js';
import { Command } from '../types';

export const helpCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === "help") {
        const commandsFilePath = path.join(__dirname, '../../commands.json');
        const commands: Command[] = JSON.parse(fs.readFileSync(commandsFilePath, 'utf8'));

        const fields = commands.map((cmd: Command) => ({
            name: `/${cmd.name}`,
            value: cmd.description
        }));

        interaction.reply({
            "embeds": [
                {
                    "title": `muusik.app Commands`,
                    "description": `Here are the commands you can use with the muusik.app bot:`,
                    "color": 0x3A015C,
                    "fields": fields,
                },
            ],
        });
    }
};
