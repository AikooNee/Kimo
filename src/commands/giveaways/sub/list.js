const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} member
 */
module.exports = async (member) => {
  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Sorry, senpai! You need the 'Manage Messages' permission to manage giveaways.");
  }

  // Search with all giveaways
  const giveaways = member.client.giveawaysManager.giveaways.filter(
    (g) => g.guildId === member.guild.id && g.ended === false
  );

  // No giveaways
  if (giveaways.length === 0) {
    return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Senpai, there are no giveaways running in this server.");
  }

  const description = giveaways.map((g, i) => `${i + 1}. ${g.prize} in <#${g.channelId}>`).join("\n");

  try {
    return {
      embeds: [new EmbedBuilder().setColor(EMBED_COLORS.GIVEAWAYS).setDescription(description)],
    };
  } catch (error) {
    member.client.logger.error("Giveaway List", error);
    return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(`Senpai, an error occurred while listing the giveaways: ${error.message} 💔`);
  }
};
