import { CommandInteraction, GuildMember, VoiceBasedChannel } from 'discord.js';
import { player } from '..';

export const skipCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'skip') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'You need to be in a voice channel to skip songs!', ephemeral: true });
        }

        const node = player.nodes.get(voiceChannel.guild);
        if (!node) {
            return interaction.reply({ content: 'No music is currently playing in this server.', ephemeral: true });
        }

        node.node.skip();

        await interaction.reply({ content: 'Skipped to the next song.', ephemeral: true });
    }
};
