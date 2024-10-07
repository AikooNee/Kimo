const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import("discord.js").ThreadChannel} oldThread
 * @param {import("discord.js").ThreadChannel} newThread
 */
module.exports = async (client, oldThread, newThread) => {
  const settings = await getSettings(newThread.guild);
  if (!settings.logging?.threads) return;

  const logChannel = client.channels.cache.get(settings.logging.threads);
  if (!logChannel) return;

  const auditLog = await newThread.guild.fetchAuditLogs({ type: AuditLogEvent.ThreadUpdate, limit: 1 });
  const entry = auditLog.entries.first();
  const executor = entry?.target?.id === newThread.id ? entry.executor : null;

  const changes = [];
  if (oldThread.name !== newThread.name) changes.push(`**Name:** \`${oldThread.name}\` ➔ \`${newThread.name}\``);
  if (oldThread.archived !== newThread.archived)
    changes.push(`**Archived:** \`${oldThread.archived}\` ➔ \`${newThread.archived}\``);
  if (oldThread.locked !== newThread.locked)
    changes.push(`**Locked:** \`${oldThread.locked}\` ➔ \`${newThread.locked}\``);
  if (oldThread.rateLimitPerUser !== newThread.rateLimitPerUser)
    changes.push(`**Rate Limit:** \`${oldThread.rateLimitPerUser}\` ➔ \`${newThread.rateLimitPerUser}\``);

  const threadType = require("@helpers/channelTypes")(newThread.type);
  const embed = new EmbedBuilder()
    .setAuthor({ name: "Thread Updated" })
    .setColor("Yellow")
    .setDescription(`Thread **${newThread}** was updated`)
    .addFields(
      {
        name: "Thread Type",
        value: threadType,
      },
      {
        name: "Executor",
        value: executor ? executor.toString() : "Unknown",
      },
      {
        name: "Changes",
        value: changes.length > 0 ? changes.join("\n") : "No significant changes",
      }
    )
    .setTimestamp()
    .setFooter({ text: `ID: ${newThread.id}` });

  logChannel.send({ embeds: [embed] });
};
