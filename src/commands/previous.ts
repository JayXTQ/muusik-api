import { CommandInteraction, GuildMember, VoiceBasedChannel, EmbedBuilder } from 'discord.js';
import { useHistory } from 'discord-player';
import { colors } from '../types'; 

export const previousCommand = async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'previous') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('You need to be in a voice channel to play the previous song.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const history = useHistory(interaction.guildId ?? '');
        if (!history) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('No previous track history found for this server.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            await history.previous();
            const embed = new EmbedBuilder()
                .setColor(colors.Muusik)
                .setDescription('Playing the previous track.');
            await interaction.reply({ embeds: [embed], ephemeral: true  });
        } catch (error) {
            console.error('Error playing previous track:', error);
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('Unable to play the previous track.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
