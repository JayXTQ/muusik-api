import { CommandInteraction, version } from 'discord.js';
import { client, onlineSince, voiceStates } from "..";
import { colors } from "../types";

export const infoCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === "info") {
        interaction.reply({
            "embeds": [
                {
                    "title": `Muusik Information`,
                    "description":
                        `Information for [muusik.app](https://muusik.app), developed by [Jay](https://jayxtq.xyz) with love <3.

muusik.app is a free and open source Discord music bot which allows you to play your favourite music.
We have an interactive dashboard and plenty of features to keep you entertained.
For the whole list of our features, head on over to our [website](https://muusik.app).
If you are looking for our dashboard, you can find it [here](https://muusik.app/dashboard).

Bot Invite: https://muusik.app/invite
Discord Server: https://muusik.app/discord
Frontend Source: https://github.com/JayXTQ/muusik-web
Backend Source: https://github.com/JayXTQ/muusik-api`,
                    "color": colors.Muusik
                },
            ],
        });
    }
};