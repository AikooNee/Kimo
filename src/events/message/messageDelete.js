const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { getSettings } = require("@schemas/Guild");
const Policy = require("@schemas/Policy");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message|import('discord.js').PartialMessage} message
 */
module.exports = async (client, message) => {
  if (message.partial || message.author.bot || !message.guild) return;

  const settings = await getSettings(message.guild);

  /*const policy = await Policy.findOne({ userId: message.author.id });
  if (policy && policy.accepted) {*/
    const snipe = {
      channel: message.channel.id,
      username: message.member.displayName,
      content: message.content || "unknown",
      userAvatar: message.author.displayAvatarURL(),
      deletedAt: new Date(),
    };

    settings.snipe = snipe;
    await settings.save();
  //}

  if (!settings.logging.messages) return;
  const logChannel = client.channels.cache.get(settings.logging.messages);

  const { content, author } = message;
  const entry = await message.guild
    .fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 })
    .then((audit) => audit.entries.first());

  let user = "";
  if (entry && entry.extra.channel.id === message.channel.id && entry.target.id === message.id) {
    user = entry.executor.username;
  }

  const logEmbed = new EmbedBuilder()
    .setAuthor({ name: "Message Deleted" })
    .setThumbnail(author.displayAvatarURL())
    .setColor("#2c2d31")
    .setFields(
      { name: "Author", value: author.toString(), inline: true },
      { name: "Channel", value: message.channel.toString(), inline: true },
      { name: "Deleted Message", value: `> ${content}` },
      { name: "Deleted By", value: user ? user : "Unknown" }
    )
    .setTimestamp();
    
  logChannel.safeSend({ embeds: [logEmbed] });
};