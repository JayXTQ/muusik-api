import { CommandInteraction, version } from 'discord.js';
import { client, onlineSince, voiceStates } from "..";
import { colors } from "../types";

export default async (interaction: CommandInteraction) => {
    if (interaction.commandName === "vote") {
        interaction.reply({
            "embeds": [
                {
                    "title": `Vote for Muusik!`,
                    "description":
                        `Even though as are open source, we are still on top.gg! We also don't give you any additional features or benefits if you vote, but it would be greatly appreciated if you did! Vote here: https://top.gg/bot/1137124050792087682`,
                    "color": colors.Muusik
                },
            ],
        });
    }
};