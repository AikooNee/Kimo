const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 * @param {number} addDuration
 * @param {string} newPrize
 * @param {number} newWinnerCount
 */
module.exports = async (member, messageId, addDuration, newPrize, newWinnerCount) => {
  if (!messageId) return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Senpai, you must provide a valid message id.");

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Sorry, senpai! You need the 'Manage Messages' permission to edit giveaways.");
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(`Senpai, unable to find a giveaway for messageId: ${messageId}`);

  try {
    await member.client.giveawaysManager.edit(messageId, {
      addTime: addDuration || 0,
      newPrize: newPrize || giveaway.prize,
      newWinnerCount: newWinnerCount || giveaway.winnerCount,
    });

    return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(`Senpai, the giveaway has been successfully updated! 🌟`);
  } catch (error) {
    member.client.logger.error("Giveaway Edit", error);
    return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(`Senpai, an error occurred while updating the giveaway: ${error.message} 💔`);
  }
};
