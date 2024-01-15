import { CommandInteraction, GuildMember } from 'discord.js';
import { Player } from 'discord-player';
import { client, player } from '../index';

export const playCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'play') {
        const songName = interaction.options.get('song')?.value as string;

        if (!songName) {
            return interaction.reply({ content: 'Please provide a song name or URL.', ephemeral: true });
        }

        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'You need to be in a voice channel to play music!', ephemeral: true });
        }

        try {
            interaction.reply({ content: `Playing ${songName}`, ephemeral: true });
            await player.play(voiceChannel, songName, { requestedBy: interaction.user.tag });
        } catch (error) {
            console.error('Error playing the song:', error);
            interaction.reply({ content: 'There was an error playing the song.', ephemeral: true });
        }
    }
};

