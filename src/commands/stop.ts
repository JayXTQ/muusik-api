import { CommandInteraction, GuildMember } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { player } from '..';

export const stopCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'stop') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'You need to be in a voice channel to stop the music.', ephemeral: true });
        }

        const node = player.nodes.get(interaction.guildId!);
        if (!node) {
            return interaction.reply({ content: 'No music is currently playing in this server.', ephemeral: true });
        }

        node.node.stop();

        const connection = getVoiceConnection(interaction.guildId!);
        connection?.destroy();

        await interaction.reply({ content: 'Stopped the music and left the voice channel.', ephemeral: true });
    }
};
