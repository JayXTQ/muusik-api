import { CommandInteraction, version } from 'discord.js';
import { client, onlineSince, voiceStates } from "..";
import { colors } from "../types";

export const statsCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === "stats") {
        interaction.reply({
            "embeds": [
                {
                    "title": `Muusik Stats`,
                    "description":
                        `Statistics regarding the official bot for [muusik.app](https://muusik.app)`,
                    "color": colors.Muusik,
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
                            "name": `Went online`,
                            "value": `<t:${Math.floor(onlineSince / 1000)}:R>`,
                            "inline": true,
                        },
                        {
                            "name": 'Servers',
                            "value": String(client.guilds.cache.size),
                            "inline": true,
                        },
                        {
                            "name": 'Users watching',
                            "value": voiceStates.size.toString(),
                            "inline": true,
                        }
                    ],
                },
            ],
        });
    }
};