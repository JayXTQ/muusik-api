const dev = Deno.env.get("DENO_DEPLOYMENT_ID") === undefined; // Checks if in development or production, using DENO_DEPLOYMENT_ID as a check. Deno Deploy sets this value, but local does not.

import { load } from "https://deno.land/std@0.196.0/dotenv/mod.ts";
const env = await load() as Record<string, string | undefined>;

import { Hono } from "https://deno.land/x/hono@v3.3.1/mod.ts";

import {
    // joinVoiceChannel,
    // getVoiceConnection,
    // DiscordGatewayAdapterCreator
    version as voiceversion,
} from "npm:@discordjs/voice";

import { isChatInputApplicationCommandInteraction } from "npm:discord-api-types/utils";

import { REST, version as restversion } from "npm:@discordjs/rest";
import {
    version as wsversion,
    WebSocketManager,
    WebSocketShardEvents,
} from "npm:@discordjs/ws";
import {
    APIRole,
    Client,
    GatewayDispatchEvents,
    GatewayIntentBits,
    InteractionType,
    version as coreversion,
} from "npm:@discordjs/core";
import { Md5 } from "https://deno.land/std@0.119.0/hash/md5.ts";
import axiod from "https://deno.land/x/axiod@0.26.2/mod.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const md5 = new Md5();

import "npm:bufferutil";

const rest = new REST().setToken(env.TOKEN || Deno.env.get("TOKEN") as string);

const gateway = new WebSocketManager({
    token: env.TOKEN || Deno.env.get("TOKEN") as string,
    intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMembers |
        GatewayIntentBits.GuildVoiceStates,
    rest,
});

const client = new Client({ rest, gateway });

const voiceStates = new Map<string, { guild_id: string; channel_id: string }>();

let onlineSince: number;
let latency: number | string = "Not available";

client.on(GatewayDispatchEvents.VoiceStateUpdate, (i) => {
    if (i.data.channel_id && i.data.guild_id) {
        voiceStates.set(i.data.user_id, {
            guild_id: i.data.guild_id,
            channel_id: i.data.channel_id,
        });
    } else {
        voiceStates.delete(i.data.user_id);
    }
});

client.on(GatewayDispatchEvents.Ready, () => {
    onlineSince = Date.now();
    client.api.applicationCommands.createGlobalCommand("1137124050792087682", {
        name: "info",
        description: "Get information regarding the bot",
        dm_permission: true,
    });
    client.api.applicationCommands.createGlobalCommand("1137124050792087682", {
        name: "help",
        description: "Get help with the muusik.app bot",
        dm_permission: true,
    });
    // client.api.applicationCommands.createGlobalCommand("1137124050792087682", {
    //     name: 'config',
    //     description: 'Configure the bot',
    //     dm_permission: false,
    //     options: [
    //         {
    //             type: 1,
    //             name: 'dj',
    //             description: 'The role to use for bypassing limitations',
    //             options: [
    //                 {
    //                     type: 8,
    //                     name: 'role',
    //                     description: 'The role to use for DJ permissions',
    //                     required: true
    //                 }
    //             ]
    //         }
    //     ],
    //     default_member_permissions: "0"
    // });
});

gateway.on(WebSocketShardEvents.HeartbeatComplete, (i) => {
    latency = i.latency;
});

client.on(GatewayDispatchEvents.InteractionCreate, async (i) => {
    if (
        i.data.type === InteractionType.ApplicationCommand &&
        isChatInputApplicationCommandInteraction(i.data)
    ) {
        switch (i.data.data.name) {
            case "info":
                i.api.interactions.reply(i.data.id, i.data.token, {
                    "embeds": [
                        {
                            "title": `Muusik Information`,
                            "description":
                                `Information regarding the official bot for [muusik.app](https://muusik.app)`,
                            "color": 0x3A015C,
                            "fields": [
                                {
                                    "name": `Engines`,
                                    "value": `Deno (API): ${
                                        Deno.version.deno === ""
                                            ? `Unknown`
                                            : `v${Deno.version.deno}`
                                    }\n@discordjs/core: v${coreversion}\n@discordjs/ws: v${wsversion}\n@discordjs/rest: v${restversion}\n@discordjs/voice: v${voiceversion}`,
                                    "inline": true,
                                },
                                {
                                    "name": `Avg. Heartbeat`,
                                    "value": String(latency),
                                    "inline": true,
                                },
                                {
                                    "name": `Shards`,
                                    "value": String(
                                        await client.gateway.getShardCount(),
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
                i.api.interactions.reply(i.data.id, i.data.token, {
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
            // case "config": {
            //     if(checkIfPermission(i.data.member?.permissions as string, 0x8) === false) {
            //         type ConfigOptions = {
            //             type: number;
            //             options: Array<{
            //                 type: number;
            //                 name: string;
            //                 value: string | number | boolean;
            //             }>;
            //             name: string;
            //         }
            //         const options = (i.data.data.options as ConfigOptions[])[0] as ConfigOptions;
            //         switch (options.name) {
            //             case "dj": {
            //                 // await axiod.post(`http${
            //                 //     dev ? "://localhost:5173" : "s://muusik.app"
            //                 // }/api/update-guild`, {
            //                 //     type: "dj",
            //                 //     guild: i.data.guild_id,
            //                 //     value: options.options[0].value
            //                 // }, {
            //                 //     headers: {
            //                 //         "Authorization": env.FRONTEND_API_KEY || Deno.env.get("FRONTEND_API_KEY") as string
            //                 //     }
            //                 // })
            //                 break;
            //             }
            //         }
            //     } else {
            //         i.api.interactions.reply(i.data.id, i.data.token, {
            //             "embeds": [
            //                 {
            //                     "title": `Config`,
            //                     "description": `You do not have permission to use this command`,
            //                     "color": 0x3A015C,
            //                 },
            //             ],
            //         });
            //     }
            // }
        }
    }
});

gateway.connect();

type Variables = {
    message: string;
};

const app = new Hono<{ Variables: Variables }>({ strict: false });

app.get("/", (c) => c.redirect("https://muusik.app"));

app.get("/find-user", async (c) => {
    c.header("Access-Control-Allow-Origin", "*");
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
        channel = await client.api.channels.get(channel_.channel_id);
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
    c.header("Access-Control-Allow-Origin", "*");
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
    c.status(501);
    // const channel = await client.api.channels.get(state.channel_id) as APITextChannel
    // joinVoiceChannel({
    // 	channelId: channel.id,
    // 	guildId: guild.id,
    // 	adapterCreator: {
    // 		type: 'websocket',
    // 		debug: true
    // 	},
    // 	selfDeaf: true,
    // })
});

app.get("/auth/:type", (c) => {
    const { type } = c.req.param();
    switch (type) {
        case "lastfm":
            c.status(303);
            return c.redirect(
                `https://www.last.fm/api/auth/?api_key=${
                    encodeURIComponent(
                        env.LASTFM_API_KEY ||
                            Deno.env.get("LASTFM_API_KEY") as string,
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
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Credentials", "true");
    const { query } = c.req.query() as { query: string };
    let { limit } = c.req.query() as { limit: string | number };
    limit = limit ? parseInt(limit as string) : Infinity;
    if (query === "undefined" || !query) {
        c.status(400);
        return c.json({ success: false, message: "No query provided" });
    }
    const song = await axiod.get(
        `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${
            encodeURIComponent(query)
        }&api_key=${
            env.LASTFM_API_KEY || Deno.env.get("LASTFM_API_KEY") as string
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

    for (let i = 0; i < searchLimit; i++) {
        try {
            await axiod.get(tracks.track[i].url).then((r) => {
                const data = r.data;
                if (r.status !== 200) {
                    return { success: false, message: data.message };
                }
                const $ = cheerio.load(data);
                const playlinks = $("a.play-this-track-playlink");
                const links: string[] = [];
                for (const link of playlinks) {
                    if (
                        link.attribs.href.includes("spotify" || "youtube") &&
                        !links.includes(link.attribs.href)
                    ) {
                        links.push(link.attribs.href);
                    }
                }
                tracks.track[i].links = links;
            });
        } catch (_) {
            tracks.track[i].links = [];
        }
    }

    tracks.track = tracks.track.slice(0, searchLimit);
    c.status(200);
    return c.json({ tracks, success: true });
});

app.post("/scrobble", async (c) => {
    c.header("Access-Control-Allow-Origin", "*");
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
    const res = await axiod.post(
        `http://ws.audioscrobbler.com/2.0/?method=track.scrobble&artist=${artist}&track=${track}&album=${album}&timestamp=${
            Math.floor(Date.now() / 1000)
        }&api_key=${
            env.LASTFM_API_KEY || Deno.env.get(`LASTFM_API_KEY`) as string
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
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Credentials", "true");
    const { type } = c.req.param();
    const { token } = c.req.query();
    switch (type) {
        case "lastfm": {
            let session;
            try {
                session = await axiod.get(
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

app.get("/get-roles", async (c) => {
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Credentials", "true");
    const { guild } = c.req.query();
    if (!guild) {
        c.status(400);
        return c.json({ success: false, message: "No guild provided" });
    }
    const roles = (await client.api.guilds.get(guild)).roles;
    if (!roles) {
        c.status(404);
        return c.json({ success: false, message: "No roles found" });
    }
    c.status(200);
    return c.json({ success: true, roles });
})

app.get("/check-permissions", async (c) =>{
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Credentials", "true");
    const { guild, user, permission } = c.req.query();
    if (!guild || !user) {
        c.status(400);
        return c.json({ success: false, message: "No guild or user provided" });
    }
    const member = await client.api.guilds.getMember(guild, user);
    if (!member) {
        c.status(404);
        return c.json({ success: false, message: "Member not found" });
    }
    let hasPermission = false;
    for(let role of member.roles as string[] | APIRole[]) {
        role = (await client.api.guilds.get(guild)).roles.find(r => r.id === role) as APIRole;
        if(checkIfPermission(role.permissions as string, permission)) {
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
    return md5.update(
        `api_key${
            env.LASTFM_API_KEY || Deno.env.get(`LASTFM_API_KEY`) as string
        }method${method}token${token}${
            env.LASTFM_SECRET || Deno.env.get(`LASTFM_SECRET`) as string
        }`,
    ).toString();
}

function checkIfPermission(
    permissions: number | string,
    permission: number | string,
): boolean {
    permissions = typeof permissions === "string" ? parseInt(permissions) : permissions;
    permission = typeof permission === "string" ? parseInt(permission) : permission;
    return (permissions & permission) === permission;
}

Deno.serve({ port: +(env.PORT || Deno.env.get("PORT") as string) }, app.fetch);
