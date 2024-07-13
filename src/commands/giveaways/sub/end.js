const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Senpai, you must provide a valid message id.");

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Sorry, senpai! You need the 'Manage Messages' permission to end giveaways.");
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(`Senpai, unable to find a giveaway for messageId: ${messageId}`);

  // Check if the giveaway is ended
  if (giveaway.ended) return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Senpai, the giveaway has already ended.");

  try {
    await giveaway.end();
    return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Success, senpai! The giveaway has ended! 🎉");
  } catch (error) {
    member.client.logger.error("Giveaway End", error);
    return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(`Senpai, an error occurred while ending the giveaway: ${error.message} 💔`);
  }
};
