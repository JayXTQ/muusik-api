import { CommandInteraction } from 'discord.js';

export type CommandHandler = (interaction: CommandInteraction) => void | Promise<void>;

export interface CommandHandlers {
    [commandName: string]: CommandHandler | undefined;
}

export type Command = {
    name: string;
    description: string;
    dm_permission?: boolean;
};