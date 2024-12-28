const { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').User} user
 */
module.exports = (user) => {
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(`Avatar of ${user.username}`)
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setImage(user.displayAvatarURL({ extension: "png", size: 2048 }))
        .setFooter({ text: "Note: Larger sizes may take longer to load." })
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
    ],
  };
};
