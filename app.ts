import { load } from "https://deno.land/std@0.196.0/dotenv/mod.ts";
const env = await load()

import { Hono } from 'https://deno.land/x/hono@v3.3.1/mod.ts'

import {
	joinVoiceChannel,
	getVoiceConnection,
	DiscordGatewayAdapterCreator
} from '@discordjs/voice';

import { isChatInputApplicationCommandInteraction } from "npm:discord-api-types/utils";

// import { DisTube } from 'distube'
// import { SpotifyPlugin } from '@distube/spotify'

import { REST } from '@discordjs/rest'
import { WebSocketManager, WebSocketShardEvents } from '@discordjs/ws'
import { GatewayIntentBits, Client, GatewayDispatchEvents, APITextChannel, APIGuild, ApplicationCommandType, APIApplicationCommandInteraction, InteractionType } from '@discordjs/core'
import { Md5 } from "https://deno.land/std@0.119.0/hash/md5.ts";

const md5 = new Md5()

import 'bufferutil'

const rest = new REST().setToken(env.TOKEN)

const gateway = new WebSocketManager({
	token: env.TOKEN,
	intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMembers | GatewayIntentBits.GuildVoiceStates,
	rest
})

const client = new Client({ rest, gateway })

const voiceStates = new Map<string, string>()

let onlineSince: number;
let latency: number | string = "Not available";

client.on(GatewayDispatchEvents.VoiceStateUpdate, i => {
	if (i.data.channel_id) {
		voiceStates.set(i.data.user_id, i.data.channel_id)
	} else {
		voiceStates.delete(i.data.user_id)
	}
})

client.on(GatewayDispatchEvents.Ready, () => {
	onlineSince = Date.now()
	client.api.applicationCommands.createGlobalCommand("1137124050792087682", {
		name: "info",
		description: "Get information regarding the bot",
		dm_permission: false
	})
})

gateway.on(WebSocketShardEvents.HeartbeatComplete, i => {
	latency = i.latency
})

client.on(GatewayDispatchEvents.InteractionCreate, async i => {
	if (i.data.type === InteractionType.ApplicationCommand && isChatInputApplicationCommandInteraction(i.data)) {
		switch(i.data.data.name){
			case "info":
				i.api.interactions.reply(i.data.id, i.data.token, {
					"embeds": [
						{
							"title": `Muusik Information`,
							"description": `Information regarding the official bot for [muusik.app](https://muusik.app)`,
							"color": 0x3A015C,
							"fields": [
								{
									"name": `Engines`,
									"value": `Deno (API): v1.36.0\n@discordjs/core: v1.0.0\n@discordjs/ws: v1.0.0\n@discordjs/rest: v2.0.0`,
									"inline": true
								},
								{
									"name": `Avg. Heartbeat`,
									"value": String(latency),
									"inline": true
								},
								{
									"name": `Shards`,
									"value": String(await client.gateway.getShardCount()),
									"inline": true
								},
								{
									"name": `Online since`,
									"value": `<t:${Math.floor(onlineSince/1000)}:R>`
								}
							]
						}
					]
				})
		}
	}
})

gateway.connect()

type Variables = {
	message: string
}

const app = new Hono<{ Variables: Variables }>({strict:false})

app.get('/', c => c.redirect('//muusik.app'))

app.get('/login', c => 
	c.redirect(`https://discord.com/api/oauth2/authorize?client_id=1137124050792087682&redirect_uri=https%3A%2F%2Fmuusik.app%2Fdashboard&response_type=token&scope=identify%20guilds`))

app.get('/find-user', async c => {
	c.header('Access-Control-Allow-Origin', '*')
	c.header('Access-Control-Allow-Credentials', 'true')
	const {user} = await c.req.json()
	if(!user){
		c.status(400)
		return c.json({ success: false, message: 'No user provided' })
	}
	let channel;
	try {
		const channel_ = voiceStates.get(user)
		if (!channel_) {
			c.status(400)
			return c.json({ success: false, message: 'User not in a voice channel' })
		}
		channel = await client.api.channels.get(channel_)
	} catch (_) {
		c.status(400)
		return c.json({ success: false, message: 'User not in a voice channel' })
	}
	return c.json({ channel, success: true }) 
})

app.post('/play', async c => {
	c.header('Access-Control-Allow-Origin', '*')
	c.header('Access-Control-Allow-Credentials', 'true')
	let { url, user, guild } = Object.fromEntries(await c.req.formData()) as {
		url: string
		user: string
		guild: string | APIGuild
	}
	guild = await client.api.guilds.get(guild as string) as APIGuild
	if (!url || !user || !guild) {
		c.status(400)
		return c.json({ success: false, message: 'No url, user, or guild provided' })
	}
	const state = voiceStates.get(user as string)
	if (!state) {
		c.status(400)
		return c.json({ success: false, message: 'User not in a voice channel' })
	}
	// const channel = await client.api.channels.get(state) as APITextChannel
	// joinVoiceChannel({
	// 	channelId: channel.id,
	// 	guildId: guild.id,
	// 	adapterCreator: guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
	// 	selfDeaf: true,
	// })
})

app.get('/callback/:type', c => {
	const { type } = c.req.param()
	if (type === 'lastfm') {
		return c.redirect(`https://www.last.fm/api/auth/?api_key=${env.LASTFM_KEY}`)
	}
	return c.json({ success: true })
})

app.get('/find-song', async c => {
	c.header('Access-Control-Allow-Origin', '*')
	c.header('Access-Control-Allow-Credentials', 'true')
	console.log("Got a request")
	const { query } = c.req.query()
	if (query === "undefined" || !query) {
		console.log("No query provided")
		c.status(400)
		return c.json({ success: false, message: 'No query provided' })
	}
	console.log("Got a query", typeof query)
	const song = await fetch(`http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${env.LASTFM_API_KEY}&format=json`).then(async r => {
		const data = await r.json()
		if(data.error){
			return { success: false, message: data.message }
		}
		return { success: true, data }
	})
	console.log(song)
	if (!song.success) {
		c.status(400)
		return c.json({ success: false, message: song.message })
	}
	return c.json({ song:song.data.results.trackmatches.track, success: true })
})

app.post('/scrobble', async c => {
	c.header('Access-Control-Allow-Origin', '*')
	c.header('Access-Control-Allow-Credentials', 'true')
	const { user, artist, track, album, timestamp } = Object.fromEntries(await c.req.formData()) as {
		user: string
		artist: string
		track: string
		album: string
		timestamp: string
	}
	if (!user || !artist || !track || !album || !timestamp) {
		c.status(400)
		return c.json({ success: false, message: 'No user, artist, track, album, or timestamp provided' })
	}
	const res = await fetch(`http://ws.audioscrobbler.com/2.0/?method=track.scrobble&artist=${artist}&track=${track}&album=${album}&timestamp=${Math.floor(Date.now() / 1000)}&api_key=${env.LASTFM_API_KEY}&api_sig=${md5.update(`api_key${env.LASTFM_API_KEY}methodauth.getSessiontoken${user}${env.LASTFM_SECRET}`)}&sk=${user}&format=json`, {
		method: 'POST'
	})
	const data = await res.json()
	if (data.error) {
		c.status(400)
		return c.json({ success: false, message: data.message })
	}
	return c.json({ success: true })
})

Deno.serve({ port: +env.PORT }, app.fetch)