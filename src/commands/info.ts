import { CommandInteraction, version } from 'discord.js';
import { client, onlineSince } from "../index";

export const infoCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === "info") {
        interaction.reply({
            "embeds": [
                {
                    "title": `Muusik Information`,
                    "description":
                        `Information regarding the official bot for [muusik.app](https://muusik.app)`,
                    "color": 0x3A015C,
                    "fields": [
                        {
                            "name": `Engines`,
                            "value": `Node.JS (API): ${process.version}\n@discord.js: v${version}`,
                            "inline": true,
                        },
                        {
                            "name": `Avg. Heartbeat`,
                            "value": String(client.ws.ping),
                            "inline": true,
                        },
                        {
                            "name": `Shards`,
                            "value": String(
                                client.shard?.count || 1
                            ),
                            "inline": true,
                        },
                        {
                            "name": `Online since`,
                            "value": `<t:${Math.floor(onlineSince / 1000)}:R>`,
                        },
                    ],
                },
            ],
        });
    }
};