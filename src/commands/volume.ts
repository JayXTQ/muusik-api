import { CommandInteraction, GuildMember, VoiceBasedChannel, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ButtonInteraction, ModalSubmitInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { player } from '..';
import { colors } from '../types';

export default async (interaction: CommandInteraction) => {
    if (interaction.commandName === 'volume') {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('You need to be in a voice channel to change the volume.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const node = player.nodes.get(voiceChannel.guild.id);
        if (!node || !node.currentTrack) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('No music is currently playing in this server.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const inputVolume = interaction.options.get('volume')?.value as number;
        const currentVolume = inputVolume ?? node.node.volume;

        if (inputVolume !== undefined && (inputVolume < 0 || inputVolume > 100)) {
            const embed = new EmbedBuilder()
                .setColor(colors.Error)
                .setDescription('Please provide a volume level between 0 and 100.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        node.node.setVolume(currentVolume);
        const volumeBar = createVolumeBar(currentVolume);

        const embed = new EmbedBuilder()
            .setColor(colors.Muusik)
            .setDescription(`### Volume set to ${currentVolume}%\n${volumeBar}`)
            .setImage('https://files.radnotred.dev/u/Embed_Width10px.png');

        const buttons = createVolumeButtons();
        await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
    }
};

function createVolumeBar(volume: number) {
    const totalBars = 10;
    const filledBars = Math.round((volume / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    const filledBarEmoji = '🟩';
    const emptyBarEmoji = '⬜';
    return '🔊  ' + filledBarEmoji.repeat(filledBars) + emptyBarEmoji.repeat(emptyBars);
}


function createVolumeButtons() {
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder().setCustomId('volume_down_10').setLabel('-10%').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('volume_down_5').setLabel('-5%').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('open_volume_modal').setLabel('Custom').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('volume_up_5').setLabel('+5%').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('volume_up_10').setLabel('+10%').setStyle(ButtonStyle.Primary)
        );
}

export async function handleVolumeButton(interaction: ButtonInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) return;

    const node = player.nodes.get(guildId);
    const currentTrack = node?.currentTrack;
    if (!currentTrack) {
        const embed = new EmbedBuilder()
            .setColor(colors.Error)
            .setDescription('No music is currently playing in this server.');
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.customId === 'open_volume_modal') {
        const modal = new ModalBuilder()
            .setCustomId('custom_volume_modal')
            .setTitle('Set Custom Volume')
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('custom_volume_input')
                        .setLabel('Enter a volume (0-100)')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('0-100')
                        .setValue(node.node.volume.toString())
                        .setRequired(true)
                        .setMinLength(1)
                        .setMaxLength(3)
                )
            );

        await interaction.showModal(modal);
    } else {
        let newVolume = node.node.volume;
        switch (interaction.customId) {
            case 'volume_down_10':
                newVolume = Math.max(0, newVolume - 10);
                break;
            case 'volume_down_5':
                newVolume = Math.max(0, newVolume - 5);
                break;
            case 'volume_up_5':
                newVolume = Math.min(100, newVolume + 5);
                break;
            case 'volume_up_10':
                newVolume = Math.min(100, newVolume + 10);
                break;
        }

        node.node.setVolume(newVolume);
        const volumeBar = createVolumeBar(newVolume);
        const embed = new EmbedBuilder()
            .setColor(colors.Muusik)
            .setDescription(`### Volume set to ${newVolume}%\n${volumeBar}`)
            .setImage('https://files.radnotred.dev/u/Embed_Width10px.png');
    
        await interaction.update({ embeds: [embed] });
    }
}

export async function handleVolumeModal(interaction: ModalSubmitInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) return;

    const customVolumeInput = interaction.fields.getTextInputValue('custom_volume_input');
    const customVolume = parseInt(customVolumeInput, 10);

    if (isNaN(customVolume) || customVolume < 0 || customVolume > 100) {
        const embed = new EmbedBuilder()
            .setColor(colors.Error)
            .setDescription('Please enter a valid volume number between 0 and 100.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    const node = player.nodes.get(guildId);
    const currentTrack = node?.currentTrack;
    if (!currentTrack) {
        const embed = new EmbedBuilder()
            .setColor(colors.Error)
            .setDescription('No music is currently playing in this server.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    node.node.setVolume(customVolume);
    const volumeBar = createVolumeBar(customVolume);
    const embed = new EmbedBuilder()
        .setColor(colors.Muusik)
        .setDescription(`### Volume set to ${customVolume}%\n${volumeBar}`)
        .setImage('https://files.radnotred.dev/u/Embed_Width10px.png');

    const buttons = createVolumeButtons();

    await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
}