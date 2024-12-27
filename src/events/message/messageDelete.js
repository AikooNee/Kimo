const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message|import('discord.js').PartialMessage} message
 */
module.exports = async (client, message) => {
  if (message.partial || message.author.bot || !message.guild) return;

  const settings = await getSettings(message.guild);

  settings.snipe = {
    userId: message.author.id,
    channel: message.channel.id,
    content: message.content && message.content.trim() !== "" ? message.content : null,
    proxyURL: message.attachments.size > 0 ? message.attachments.first().proxyURL : null,
    deletedAt: new Date(),
  };
  await settings.save();

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
    
  if (message.content && message.content.trim() !== "") {
    logEmbed.addFields({ name: "Deleted Message", value: `> ${message.content}` });
  }

  if (message.attachments.size > 0) {
    logEmbed.addFields({
      name: "Attachment",
      value: `[Attachment URL](${message.attachments.first().proxyURL})`,
    });
  }

  logEmbed
    .addFields(
      { name: "Author", value: author.toString(), inline: true },
      { name: "Channel", value: message.channel.toString(), inline: true },
      { name: "Deleted By", value: user ? user : "Unknown" }
    )
    .setTimestamp();

  logChannel.safeSend({ embeds: [logEmbed] });
};
