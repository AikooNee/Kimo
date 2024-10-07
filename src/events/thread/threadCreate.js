const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import("discord.js").ThreadChannel} thread
 */
module.exports = async (client, thread) => {
  const settings = await getSettings(thread.guild);
  if (!settings.logging?.threads) return;

  const logChannel = client.channels.cache.get(settings.logging.threads);
  if (!logChannel) return;

  const auditLog = await thread.guild.fetchAuditLogs({ type: AuditLogEvent.ThreadCreate, limit: 1 });
  const entry = auditLog.entries.first();
  const executor = entry?.target?.id === thread.id ? entry.executor : null;

  const threadType = require("@helpers/channelTypes")(thread.type);
  const embed = new EmbedBuilder()
    .setAuthor({ name: "Thread Created" })
    .setColor("Green")
    .setDescription(`Thread ${thread} was created`)
    .addFields(
      {
        name: "Thread Type",
        value: threadType,
      },
      {
        name: "Executor",
        value: executor ? executor.toString() : "Unknown",
      }
    )
    .setTimestamp()
    .setFooter({ text: `ID: ${thread.id}` });

  logChannel.send({ embeds: [embed] });
};
