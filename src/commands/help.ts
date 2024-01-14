import { CommandInteraction } from 'discord.js';

export const helpCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === "help") {
        interaction.reply({
            "embeds": [
                {
                    "title": `muusik.app`,
                    "description":
                        `Hello! I am the muusik.app bot written by [Jay](https://jayxtq.xyz). Thank you for using muusik.app! If you want to play music please use the [muusik.app website](https://muusik.app). For commands, check below!`,
                    "color": 0x3A015C,
                    "fields": [
                        {
                            "name": `/info`,
                            "value":
                                `Get information regarding the bot`,
                        },
                        {
                            "name": `/help`,
                            "value":
                                `Get help with the muusik.app bot`,
                        }
                    ],
                },
            ],
        });
    }
};