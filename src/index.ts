import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Client, GatewayIntentBits, REST } from "discord.js";
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

const player = new Player(client);
player.extractors.loadDefault();
const voiceStates = new Map<string, { guild_id: string; channel_id: string }>();
export let onlineSince: number;

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
});

client.on('interactionCreate', async (interaction) => {
    await interactionManager.handleInteraction(interaction);

    if (!interaction.isAutocomplete()) return;

    // if (interaction.commandName === 'play') {
    //     const query = interaction.options.getString('query');
        
    //     const searchResults: Song[] = await searchSongs(query);
        
    //     const choices = searchResults.map(song => ({ name: song.title, value: song.title }));
    //     interaction.respond(choices.slice(0, 25));
    // }
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
