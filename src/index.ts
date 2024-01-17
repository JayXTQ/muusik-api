import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { ActivityType, Client, GatewayIntentBits, REST } from "discord.js";
import { ActivityType, Client, GatewayIntentBits, REST } from "discord.js";
import { Player } from 'discord-player';
import * as routeHandlers from './routes/index';
import { interactionManager } from './modules/interactionManager';

export const client = new Client({
    intents: [
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ],
});

export const player = new Player(client);
player.extractors.loadDefault();
export const voiceStates = new Map<string, { guild_id: string; channel_id: string }>();
export let onlineSince: number;

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.member && newState.channelId) {
        if(!client.guilds.cache.get(newState.guild.id)) await client.guilds.fetch()
        if(!client.users.cache.get(newState.member.user.id)) await client.users.fetch(newState.member.user.id)
        voiceStates.set(newState.member.user.id, {
            guild_id: newState.guild.id,
            channel_id: newState.channelId,
        });
    } else if (oldState.member) {
        if(!client.guilds.cache.get(oldState.guild.id)) await client.guilds.fetch()
        if(!client.users.cache.get(oldState.member.user.id)) await client.users.fetch(oldState.member.user.id)
        if (oldState.member.user.id) {
            voiceStates.delete(oldState.member.user.id);
        }
    }
});

client.on('ready', async () => {
    console.log(player.scanDeps());
    onlineSince = Date.now();

    client.user?.setPresence({
        activities: [{
            name: "music for everyone",
            type: ActivityType.Streaming,
            url: "https://twitch.tv/jxtq",
        }],
    });
});

client.on('interactionCreate', async (interaction) => {
    await interactionManager.handleInteraction(interaction);
});

const token = process.env.TOKEN;

if (!token) {
    throw new Error("TOKEN is not defined in the environment variables");
}

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
routeHandlers.playlist(app, client, voiceStates, player, dev);
routeHandlers.queue(app, client, player, voiceStates);
routeHandlers.scrobble(app);
routeHandlers.session_type(app);
routeHandlers.skip(app, client, voiceStates, player);
routeHandlers.song_info(app);
routeHandlers.shuffle(app, client, voiceStates, player);
routeHandlers.get_owner(app, client, voiceStates);

const port = Number(process.env.PORT || 8000);
serve({ port, fetch: app.fetch });
console.log(`Server listening on port ${port}`);

client.login(process.env.TOKEN);

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

player.on('error', (error) => {
    console.error('Player Error:', error);
});
