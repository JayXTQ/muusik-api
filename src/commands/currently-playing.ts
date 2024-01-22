import { CommandInteraction, EmbedBuilder, GuildMember, VoiceBasedChannel } from 'discord.js';
import { player } from '..';
import { colors } from '../types';

export const currentlyplayingCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'currentlyplaying') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('You need to be in a voice channel to see what\'s playing!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const node = player.nodes.get(voiceChannel.guild.id);
        const currentTrack = node?.currentTrack;
        if (!currentTrack) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('No music is currently playing in this server.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const progressBar = createProgressBar(node.node.streamTime, node.node.totalDuration);

        let embed = new EmbedBuilder()
            .setTitle('Currently playing')
            .setDescription(`[${currentTrack.title} by ${currentTrack.author}](${currentTrack.url}) requested by ${currentTrack.requestedBy}\n\n${progressBar}`)
            .setColor(colors.Muusik);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

function createProgressBar(streamTime: number, totalDuration: number) {
    const totalBars = 20;
    const progressPercent = streamTime / totalDuration;
    const filledBars = Math.round(totalBars * progressPercent);
    const emptyBars = totalBars - filledBars;
    const filledBarEmoji = '▬';
    const emptyBarEmoji = '▬';
    const progressMarker = '🔘';

    const bar = filledBarEmoji.repeat(filledBars) + progressMarker + emptyBarEmoji.repeat(emptyBars);

    return `${formatTime(streamTime)} ${bar} ${formatTime(totalDuration)}`;
}

function formatTime(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}
