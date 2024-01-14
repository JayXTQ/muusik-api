import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Client, GatewayIntentBits, REST, Routes, InteractionType, version } from "discord.js";
import { Player } from 'discord-player';
import * as routeHandlers from './routes/index';

const client = new Client({
    intents: [
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ],
});

const player = new Player(client);
player.extractors.loadDefault();
const voiceStates = new Map<string, { guild_id: string; channel_id: string }>();
let onlineSince: number;

client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.member && newState.channelId) {
        voiceStates.set(newState.member.user.id, {
            guild_id: newState.guild.id,
            channel_id: newState.channelId,
        });
    } else {
        if (oldState.member?.user.id) {
            voiceStates.delete(oldState.member.user.id);
        }
    }
});

client.on('ready', async () => {
    console.log(player.scanDeps());
    onlineSince = Date.now();
    const commands = [
        {
            name: "info",
            description: "Get information regarding the bot",
            dm_permission: true,
        },
        {
            name: "help",
            description: "Get help with the muusik.app bot",
            dm_permission: true,
        },
    ]

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID as string),
        { body: commands },
    );
});

client.on('interactionCreate', (i) => {
    if (
        i.type === InteractionType.ApplicationCommand
    ) {
        switch (i.commandName) {
            case "info":
                i.reply({
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
                                    "value": `<t:${Math.floor(onlineSince / 1000)
                                        }:R>`,
                                },
                            ],
                        },
                    ],
                });
                break;
            case "help":
                i.reply({
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
                break;
        }
    }
});

const token = process.env.TOKEN;

if (!token) {
    throw new Error("TOKEN is not defined in the environment variables");
}

const rest = new REST({ version: '9' }).setToken(token);

const app = new Hono();

const dev = process.env.NODE_ENV !== 'production';

app.get("/", (c) => c.redirect("https://muusik.app"));
routeHandlers.auth_type(app, dev);
routeHandlers.check_permissions(app, client);
routeHandlers.check_playing(app, client, voiceStates, player);
routeHandlers.current_song(app, client, voiceStates, player);
routeHandlers.find_song(app);
routeHandlers.findUser(app, client, voiceStates);
routeHandlers.get_playlinks(app);
routeHandlers.get_roles(app, client);
routeHandlers.get_user(app, client);
routeHandlers.pause(app, client, voiceStates, player);
routeHandlers.play(app, client, voiceStates, player);
routeHandlers.playlist(app, client, voiceStates, player);
routeHandlers.queue(app, client, player, voiceStates);
routeHandlers.scrobble(app);
routeHandlers.session_type(app);
routeHandlers.skip(app, client, voiceStates, player);

const port = Number(process.env.PORT || 8000);
serve({ port, fetch: app.fetch });
console.log(`Server listening on port ${port}`);

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.username}!`);
});

client.login(process.env.TOKEN);

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

player.on('error', (error) => {
    console.error('Player Error:', error);
});
