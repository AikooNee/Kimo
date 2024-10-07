const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId)
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription("Senpai, you must provide a valid message id.");

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription("Sorry, senpai! You need the 'Manage Messages' permission to manage giveaways.");
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway)
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(`Senpai, unable to find a giveaway for messageId: ${messageId}`);

  // Check if the giveaway is unpaused
  if (!giveaway.pauseOptions.isPaused)
    return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Senpai, this giveaway is not paused.");

  try {
    await giveaway.unpause();
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription("Success, senpai! The giveaway has been revive!");
  } catch (error) {
    member.client.logger.error("Giveaway Resume", error);
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(`Senpai, an error occurred while unpausing the giveaway: ${error.message} 💔`);
  }
};
