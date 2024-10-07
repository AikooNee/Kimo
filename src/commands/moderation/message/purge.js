const { purgeMessages } = require("@helpers/ModUtils");
const { EMBED_COLORS } = require("@root/config");
const { EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "purge",
  description: "deletes the specified amount of messages",
  category: "MODERATION",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],
  command: {
    enabled: true,
    usage: "<amount>",
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const amount = args[0];

    if (isNaN(amount)) {
      const embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Numbers are only allowed");
      return message.safeReply({ embeds: [embed] }, 5);
    }
    if (parseInt(amount) > 99) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription("The max amount of messages that I can delete is 99");
      return message.safeReply({ embeds: [embed] }, 5);
    }

    const { channel } = message;
    const response = await purgeMessages(message.member, channel, "ALL", amount);

    if (typeof response === "number") {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(`Successfully deleted ${response} messages`);
      return channel.safeSend({ embeds: [embed] }, 5);
    } else if (response === "BOT_PERM") {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription("I don't have `Read Message History` & `Manage Messages` to delete messages");
      return message.safeReply({ embeds: [embed] }, 5);
    } else if (response === "MEMBER_PERM") {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription("You don't have `Read Message History` & `Manage Messages` to delete messages");
      return message.safeReply({ embeds: [embed] }, 5);
    } else if (response === "NO_MESSAGES") {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription("No messages found that can be cleaned");
      return channel.safeSend({ embeds: [embed] }, 5);
    } else {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription("Error occurred! Failed to delete messages");
      return message.safeReply({ embeds: [embed] }, 5);
    }
  },
};
