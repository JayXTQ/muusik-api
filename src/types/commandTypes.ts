import { CommandInteraction } from 'discord.js';

export type CommandHandler = (interaction: CommandInteraction) => void | Promise<void>;

export interface CommandHandlers {
    [commandName: string]: CommandHandler | undefined;
}
