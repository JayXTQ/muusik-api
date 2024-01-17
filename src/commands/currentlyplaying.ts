import { CommandInteraction, GuildMember, VoiceBasedChannel } from 'discord.js';
import { player } from '..';

export const currentlyPlayingCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'currentlyplaying') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'You need to be in a voice channel to see what is currently playing.', ephemeral: true });
        }

        const node = player.nodes.get(voiceChannel.guild.id);
        if (!node || !node.tracks.data || node.tracks.data.length === 0) {
            return interaction.reply({ content: 'No music is currently playing in this server.', ephemeral: true });
        }

        const currentTrack = node.tracks.data[0];
        if (!currentTrack) {
            return interaction.reply({ content: 'No track is currently playing.', ephemeral: true });
        }

        await interaction.reply({
            content: `Currently playing: ${currentTrack.title} requested by ${currentTrack.requestedBy}`,
            ephemeral: true
        });
    }
};
