const { ChannelType, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').GuildTextBasedChannel} giveawayChannel
 * @param {number} duration
 * @param {string} prize
 * @param {number} winners
 * @param {import('discord.js').User} [host]
 * @param {string[]} [allowedRoles]
 */
module.exports = async (member, giveawayChannel, duration, prize, winners, host, discription, allowedRoles = []) => {
  try {
    if (!host) host = member.user;
    if (!member.permissions.has("ManageMessages")) {
      return new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription("Sorry, senpai! You need the 'Manage Messages' permission to start giveaways.");
    }

    if (!giveawayChannel.type === ChannelType.GuildText) {
      return new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription("UwU, you can only start giveaways in text channels, senpai!");
    }

    /**
     * @type {import("discord-giveaways").GiveawayStartOptions}
     */
    const options = {
      duration: duration,
      prize,
      winnerCount: winners,
      hostedBy: host,
      thumbnail: "https://imgur.com/ctYyxQf.gif",
      messages: {
        /* giveaway: "**GIVEAWAY** 🎉",
        giveawayEnded: "**GIVEAWAY ENDED**", */
        inviteToParticipate: "React with 🎁 to enter!",
        dropMessage: "Be the first to react with 🎁 to win",
        discriptions: `${discription}`,
        hostedBy: `\nHosted by: ${host.username}`,
      },
    };

    if (allowedRoles.length > 0) {
      options.exemptMembers = (member) => !member.roles.cache.find((role) => allowedRoles.includes(role.id));
    }

    await member.client.giveawaysManager.start(giveawayChannel, options);
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(`Senpai, the giveaway has started in ${giveawayChannel}! Good luck! 🍀`);
  } catch (error) {
    member.client.logger.error("Anime Giveaway Start", error);
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(`Senpai, an error occurred while starting the  giveaway: ${error.message} 💔`);
  }
};
