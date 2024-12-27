const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import('@structures/BaseContext')}
 */
module.exports = {
  name: "avatar",
  description: "Displays avatar information about the user",
  type: ApplicationCommandType.User,
  enabled: true,
  ephemeral: true,

  async run(interaction) {
    const user = await interaction.client.users.fetch(interaction.targetId);

    return await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Avatar of ${user.username}`)
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setImage(user.displayAvatarURL({ extension: "png", size: 2048 }))
          .setDescription(`Click on the buttons below to get the avatar images in different sizes.`)
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("x512")
            .setURL(user.displayAvatarURL({ extension: "png", size: 512 }))
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel("x1024")
            .setURL(user.displayAvatarURL({ extension: "png", size: 1024 }))
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel("x2048")
            .setURL(user.displayAvatarURL({ extension: "png", size: 2048 }))
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel("x4096")
            .setURL(user.displayAvatarURL({ extension: "png", size: 4096 }))
            .setStyle(ButtonStyle.Link)
        )
      ]
    });
  },
};
