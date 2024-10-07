const { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').User} user
 */
module.exports = (user) => {
  const x512 = user.displayAvatarURL({ extension: "png", size: 512 });
  const x1024 = user.displayAvatarURL({ extension: "png", size: 1024 });
  const x2048 = user.displayAvatarURL({ extension: "png", size: 2048 });
  const x4096 = user.displayAvatarURL({ extension: "png", size: 4096 });

  const button512 = new ButtonBuilder().setLabel("x512").setURL(x512).setStyle(ButtonStyle.Link);
  const button1024 = new ButtonBuilder().setLabel("x1024").setURL(x1024).setStyle(ButtonStyle.Link);
  const button2048 = new ButtonBuilder().setLabel("x2048").setURL(x2048).setStyle(ButtonStyle.Link);
  const button4096 = new ButtonBuilder().setLabel("x4096").setURL(x4096).setStyle(ButtonStyle.Link);

  const actionRow = new ActionRowBuilder().addComponents(button512, button1024, button2048, button4096);

  const embed = new EmbedBuilder()
    .setTitle(`Avatar of ${user.username}`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setImage(x2048)
    .setFooter({ text: "Note: Larger sizes may take longer to load." });

  return {
    embeds: [embed],
    components: [actionRow],
  };
};
