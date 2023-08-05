import { load } from "https://deno.land/std@0.196.0/dotenv/mod.ts";
const env = await load()

import { Hono } from 'https://deno.land/x/hono@v3.3.1/mod.ts'

// import {
// 	joinVoiceChannel,
// 	getVoiceConnection,
// } from 'npm:@discordjs/voice';

// import { DisTube } from 'distube'
// import { SpotifyPlugin } from '@distube/spotify'

import { REST } from 'npm:@discordjs/rest@^2.0.0'
import { WebSocketManager } from 'npm:@discordjs/ws@^1.0.0'
import { GatewayIntentBits, Client, GatewayDispatchEvents, APITextChannel, APIGuild } from 'npm:@discordjs/core@^1.0.0'

import 'npm:bufferutil@^4.0.7'

const rest = new REST().setToken(env.TOKEN)

const gateway = new WebSocketManager({
	token: env.TOKEN,
	intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMembers | GatewayIntentBits.GuildVoiceStates,
	rest
})

const client = new Client({ rest, gateway })

// const distube = new DisTube(client, {
// 	emitNewSongOnly: true,
// 	leaveOnFinish: true,
// 	leaveOnEmpty: true,
// 	emitAddSongWhenCreatingQueue: false,
// 	plugins: [new SpotifyPlugin()]
// })

const voiceStates = new Map<string, string>()

client.on(GatewayDispatchEvents.VoiceStateUpdate, i => {
	console.log(i.data)
	if (i.data.channel_id) {
		voiceStates.set(i.data.user_id, i.data.channel_id)
	} else {
		voiceStates.delete(i.data.user_id)
	}
})

gateway.connect()

type Variables = {
	message: string
}

const app = new Hono<{ Variables: Variables }>({strict:false})

app.get('/', c => c.redirect('//muusik.app'))

app.get('/login', c => 
	c.redirect(`https://discord.com/api/oauth2/authorize?client_id=1137124050792087682&redirect_uri=http%3A%2F%2Flocalhost%3A5714%2Fcallback&response_type=code&scope=identify%20rpc.voice.read%20guilds`))

app.post('/find-user', async c => {
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
	let { url, user, guild } = Object.fromEntries(await c.req.formData()) as {
		url: string
		user: string
		guild: string | APIGuild
	}
	guild = JSON.parse(guild as string) as APIGuild
	if (!url || !user || !guild) {
		c.status(400)
		return c.json({ success: false, message: 'No url, user, or guild provided' })
	}
	// const status = getVoiceConnection(guild.id as string)
	// if(status || status){
	// 	c.status(400)
	// 	return c.json({ success: false, message: 'Already playing' })
	// }
	const state = voiceStates.get(user as string)
	if (!state) {
		c.status(400)
		return c.json({ success: false, message: 'User not in a voice channel' })
	}
	const channel = await client.api.channels.get(state) as APITextChannel
	// distube.play(channel, url)
})

// app.get('/callback/:type', c => {
// 	const { type } = c.req.param()
// 	if (type === 'lastfm') {
// 	}
// 	return c.json({ success: true })
// })

Deno.serve({ port: +env.PORT }, app.fetch)