import 'dotenv/config'

const dev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import axios from "axios";
import { createHash } from "crypto";
import { load } from 'cheerio';

import { Client, GatewayIntentBits, InteractionType, version, Guild, Role, Events, REST, Routes, VoiceBasedChannel } from "discord.js";
import { GuildQueue, Player } from 'discord-player';

const client = new Client({
    intents: [GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers]
});

const player = new Player(client);
player.extractors.loadDefault();

const voiceStates = new Map<string, { guild_id: string; channel_id: string }>();

let onlineSince: number;

const rest = new REST().setToken(process.env.TOKEN as string);

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    if (newState.channelId && newState.guild.id) {
        voiceStates.set(newState.id, {
            guild_id: newState.guild.id,
            channel_id: newState.channelId,
        });
    } else {
        voiceStates.delete(oldState.id);
    }
});

client.on(Events.ClientReady, async () => {
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

client.on(Events.InteractionCreate, (i) => {
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
                                        client.shard?.count
                                    ),
                                    "inline": true,
                                },
                                {
                                    "name": `Online since`,
                                    "value": `<t:${
                                        Math.floor(onlineSince / 1000)
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

client.login(process.env.TOKEN as string);

type Variables = {
    message: string;
};

const app = new Hono<{ Variables: Variables }>({ strict: false });

app.get("/", (c) => c.redirect("https://muusik.app"));

app.get("/find-user", (c) => {
    c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    c.header("Access-Control-Allow-Credentials", "true");
    const { user } = c.req.query();
    if (!user) {
        c.status(400);
        return c.json({ success: false, message: "No user provided" });
    }
    let channel;
    try {
        const channel_ = voiceStates.get(user);
        if (!channel_) {
            c.status(404);
            return c.json({
                success: false,
                message: "User not in a voice channel",
            });
        }
        channel = client.channels.cache.get(channel_.channel_id);
    } catch (_) {
        c.status(404);
        return c.json({
            success: false,
            message: "User not in a voice channel",
        });
    }
    c.status(200);
    return c.json({ channel, success: true });
});

app.post("/play", async (c) => {
    c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    c.header("Access-Control-Allow-Credentials", "true");
    const { url, user } = await c.req.json() as {
        url: string;
        user: string;
    };
    if (!url || !user) {
        c.status(400);
        return c.json({
            success: false,
            message: "No url or user provided",
        });
    }
    const state = voiceStates.get(user as string);
    if (!state) {
        c.status(404);
        return c.json({
            success: false,
            message: "User not in a voice channel",
        });
    }
    const channel = client.channels.cache.get(state.channel_id) as VoiceBasedChannel;
    try{
        await player.play(channel, url, { requestedBy: user });
    } catch(e) {
        console.log(e)
    }
    c.status(200);
    return c.json({ success: true });
});

app.get("/auth/:type", (c) => {
    const { type } = c.req.param();
    switch (type) {
        case "lastfm":
            c.status(303);
            return c.redirect(
                `https://www.last.fm/api/auth/?api_key=${
                    encodeURIComponent(
                        process.env.LASTFM_API_KEY as string,
                    )
                }&cb=${
                    encodeURIComponent(
                        `http${
                            dev ? "://localhost:5173" : "s://muusik.app"
                        }/callback/lastfm`,
                    )
                }`,
            );
    }
    return c.json({ success: false });
});

app.get("/find-song", async (c) => {
    c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    c.header("Access-Control-Allow-Credentials", "true");
    const { query } = c.req.query() as { query: string };
    let { limit } = c.req.query() as { limit: string | number };
    limit = limit ? parseInt(limit as string) : 10;
    if (query === "undefined" || !query) {
        c.status(400);
        return c.json({ success: false, message: "No query provided" });
    }
    const song = await axios.get(
        `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${
            encodeURIComponent(decodeURIComponent(query))
        }&api_key=${
            process.env.LASTFM_API_KEY as string
        }&format=json`,
    ).then((r) => {
        if (r.status !== 200) {
            return { success: false, status: r.status };
        }
        return { success: true, data: r.data.results };
    });
    if (!song.success) {
        c.status(400);
        return c.json({ success: false, message: song.status });
    }

    const tracks = song.data.trackmatches;

    const searchLimit = (limit >= tracks.track.length)
        ? tracks.track.length
        : limit;

    tracks.track = tracks.track.slice(0, searchLimit);
    c.status(200);
    return c.json({ tracks, success: true });
});

app.get("/get-playlinks", async (c) => {
    c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    c.header("Access-Control-Allow-Credentials", "true");
    const { url } = c.req.query() as { url: string };
    let links: string[] = [];
    try {
        await axios.get(decodeURIComponent(url)).then((r) => {
            const data = r.data;
            if (r.status !== 200) {
                return { success: false, message: data.message };
            }
            const $ = load(data);
            const playlinks = $("a.play-this-track-playlink");
            const links_: string[] = [];
            for (const link of Array.from(playlinks)) {
                if (
                    (link.attribs.href.includes("spotify") || link.attribs.href.includes("youtube")) &&
                    !links_.includes(link.attribs.href)
                ) {
                    links_.push(link.attribs.href);
                }
            }
            links = links_;
        });
    } catch (_) {
        links = [];
    }
    c.status(200);
    return c.json({ links, success: true });
})

app.get("/queue", async (c) => {
    c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    c.header("Access-Control-Allow-Credentials", "true");
    const { user } = c.req.query() as { user: string };
    if (!user) {
        c.status(400);
        return c.json({ success: false, message: "No user provided" });
    }
    const state = voiceStates.get(user as string);
    if (!state) {
        c.status(404);
        return c.json({
            success: false,
            message: "User not in a voice channel",
        });
    }
    const channel = client.channels.cache.get(state.channel_id) as VoiceBasedChannel;
    const node = player.nodes.get(channel.guild);
    if(!node) {
        c.status(404);
        return c.json({
            success: false,
            message: "No queue found",
        });
    }
    const queue = node.tracks.data || [];
    const history = node.history.tracks.data || [];
    return c.json({ queue, history, success: true });
})

app.get("/current-song", async (c) => {
    c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    c.header("Access-Control-Allow-Credentials", "true");
    const { user } = c.req.query() as { user: string };
    if (!user) {
        c.status(400);
        return c.json({ success: false, message: "No user provided" });
    }
    const state = voiceStates.get(user as string);
    if (!state) {
        c.status(404);
        return c.json({
            success: false,
            message: "User not in a voice channel",
        });
    }
    const channel = client.channels.cache.get(state.channel_id) as VoiceBasedChannel;
    const queue = player.nodes.get(channel.guild)
    if(!queue) {
        c.status(404);
        return c.json({
            success: false,
            message: "No queue found",
        });
    }
    return c.json({ song: queue.currentTrack, success: true });
})

app.get("/get-user", async (c) => {
    c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    c.header("Access-Control-Allow-Credentials", "true");
    const { user } = c.req.query() as { user: string };
    if (!user) {
        c.status(400);
        return c.json({ success: false, message: "No user provided" });
    }
    return c.json({ user: client.users.cache.get(user), success: true });
})

app.post("/skip", async (c) => {
    c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    c.header("Access-Control-Allow-Credentials", "true");
    const { user } = await c.req.json() as { user: string };
    if (!user) {
        c.status(400);
        return c.json({ success: false, message: "No user provided" });
    }
    const state = voiceStates.get(user as string);
    if (!state) {
        c.status(404);
        return c.json({
            success: false,
            message: "User not in a voice channel",
        });
    }
    const channel = client.channels.cache.get(state.channel_id) as VoiceBasedChannel;
    const queue = player.nodes.get(channel.guild)
    if(!queue) {
        c.status(404);
        return c.json({
            success: false,
            message: "No queue found",
        });
    }
    queue.node.skip();
    c.status(200);
    return c.json({ success: true });
})

app.post("/pause", async (c) => {
    c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    c.header("Access-Control-Allow-Credentials", "true");

    const { user } = await c.req.json() as { user: string };
    if (!user) {
        c.status(400);
        return c.json({ success: false, message: "No user provided" });
    }
    const state = voiceStates.get(user as string);
    if (!state) {
        c.status(404);
        return c.json({
            success: false,
            message: "User not in a voice channel",
        });
    }
    const channel = client.channels.cache.get(state.channel_id) as VoiceBasedChannel;
    const queue = player.nodes.get(channel.guild)
    if(!queue) {
        c.status(404);
        return c.json({
            success: false,
            message: "No queue found",
        });
    }
    queue.node.setPaused(!queue.isPlaying as unknown as boolean);
    c.status(200);
    return c.json({ success: true });
})

app.post("/scrobble", async (c) => {
    c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    c.header("Access-Control-Allow-Credentials", "true");
    const { user, artist, track, album, timestamp } = await c.req.json() as {
        user: string;
        artist: string;
        track: string;
        album: string;
        timestamp: string;
    };
    if (!user || !artist || !track || !album || !timestamp) {
        c.status(400);
        return c.json({
            success: false,
            message: "No user, artist, track, album, or timestamp provided",
        });
    }
    const res = await axios.post(
        `http://ws.audioscrobbler.com/2.0/?method=track.scrobble&artist=${artist}&track=${track}&album=${album}&timestamp=${
            Math.floor(Date.now() / 1000)
        }&api_key=${
            process.env.LASTFM_API_KEY as string
        }&api_sig=${
            encodeURIComponent(generateSigniture("track.scrobble", user))
        }&sk=${user}&format=json`,
    );
    if (res.status !== 200) {
        c.status(400);
        return c.json({ success: false, status: res.status });
    }
    c.status(200);
    return c.json({ success: true });
});

app.get("/session/:type", async (c) => {
    c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    c.header("Access-Control-Allow-Credentials", "true");
    const { type } = c.req.param();
    const { token } = c.req.query();
    switch (type) {
        case "lastfm": {
            let session;
            try {
                session = await axios.get(
                    `http://ws.audioscrobbler.com/2.0/?method=auth.getSession&sk=${
                        encodeURIComponent(token)
                    }&api_key=${
                        encodeURIComponent(
                            generateSigniture("auth.getSession", token),
                        )
                    }&format=json`,
                );
            } catch (e) {
                return c.json({ success: false, message: e });
            }
            if (session.status !== 200) {
                return c.json({ success: false, status: session.status });
            } else {
                c.status(200);
                return c.json({ success: true, data: session.data });
            }
        }
    }
    return c.json({ success: false });
});

app.get("/get-roles", (c) => {
    c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    c.header("Access-Control-Allow-Credentials", "true");
    const { guild } = c.req.query();
    if (!guild) {
        c.status(400);
        return c.json({ success: false, message: "No guild provided" });
    }
    const roles = (client.guilds.cache.get(guild) as Guild).roles;
    if (!roles) {
        c.status(404);
        return c.json({ success: false, message: "No roles found" });
    }
    c.status(200);
    return c.json({ success: true, roles });
})

app.get("/check-permissions", async (c) =>{
    c.header("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN);
    c.header("Access-Control-Allow-Credentials", "true");
    const { guild, user, permission } = c.req.query();
    if (!guild || !user) {
        c.status(400);
        return c.json({ success: false, message: "No guild or user provided" });
    }
    const member = await client.guilds.cache.get(guild)?.members.fetch(user)
    if (!member) {
        c.status(404);
        return c.json({ success: false, message: "Member not found" });
    }
    let hasPermission = false;
    for(let role of member.roles.cache.keys() as unknown as Role[] | string[]) {
        role = (client.guilds.cache.get(guild) as Guild).roles.cache.find(r => r.id === role) as Role;
        if(checkIfPermission(role.permissions as unknown as string, permission)) {
            hasPermission = true;
        }
    }
    if(!hasPermission) {
        c.status(403);
        return c.json({ success: false, message: "Member does not have permission" });
    }
    c.status(200);
    return c.json({ success: true });
})

function generateSigniture(method: string, token: string) {
    return createHash('md5').update(
        `api_key${
            process.env.LASTFM_API_KEY as string
        }method${method}token${token}${
            process.env.LASTFM_SECRET as string
        }`,
    ).digest("hex").toString();
}

function checkIfPermission(
    permissions: number | string,
    permission: number | string,
): boolean {
    permissions = typeof permissions === "string" ? parseInt(permissions) : permissions;
    permission = typeof permission === "string" ? parseInt(permission) : permission;
    return (permissions & permission) === permission;
}

serve({ port: +(process.env.PORT as string) as number, fetch: app.fetch });
console.log(`Listening on port ${process.env.PORT}`);

process.on('uncaughtException', function (err) {
    console.error(err.stack);
});