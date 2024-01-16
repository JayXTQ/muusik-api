import { CommandInteraction, GuildMember, VoiceBasedChannel } from 'discord.js';
import { player } from '../index';

export const pauseCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'pause') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'You need to be in a voice channel to pause the music!', ephemeral: true });
        }

        const node = player.nodes.get(voiceChannel.guild);
        if (!node || !node.player) {
            return interaction.reply({ content: 'No music is currently playing in this server.', ephemeral: true });
        }

        if (node.node.isPlaying()) {
            node.node.setPaused(true);
            await interaction.reply({ content: 'Music playback paused.', ephemeral: true });
        } else {
            node.node.setPaused(false);
            await interaction.reply({ content: 'Music playback resumed.', ephemeral: true });
        }
    }
};