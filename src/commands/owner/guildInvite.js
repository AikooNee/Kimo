/*
Created by Arya
Don't forget to give me credit
*/
const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = {
  name: "ginvite",
  description: "Generate an invite link for a guild.",
  category: "OWNER",
  botPermissions: ["SendMessages", "ViewChannel"],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: [],
    usage: "<guildID>",
    minArgsCount: 1,
  },

  async messageRun(message, args, data) {
    const guildID = args[0];

    if (!guildID) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Please provide a valid guild ID."),
        ],
      });
    }

    const guild = message.client.guilds.cache.get(guildID);

    if (!guild) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Guild not found.")],
      });
    }

    let mainChannel;
    guild.channels.cache.forEach((channel) => {
      if (
        channel &&
        channel.type === ChannelType.GuildText &&
        channel
          .permissionsFor(message.client.user)
          .has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel]) &&
        !mainChannel
      ) {
        mainChannel = channel;
      }
    });

    if (!mainChannel) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Unable to find a suitable text channel."),
        ],
      });
    }

    let invite;
    const reason = "Improvement purposes";
    try {
      invite = await mainChannel.createInvite({
        maxAge: 3600, // if you want the invite link to never expire, then use 0 🥰
        maxUses: 2, // if you want unlimited usages of invite link, then use 0 ❤️
        unique: true,
        reason: reason,
      });
    } catch (error) {
      // console.error("Error creating invite:", error); ignoring console errors
      invite = null;
    }

    const inviteUrl = invite && typeof invite === "object" && invite.url ? invite.url : null;

    return message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setDescription(inviteUrl ? `Invite link for ${guild.name} [Link](${inviteUrl})` : "Unable to fetch invite"),
      ],
    });
  },
};
