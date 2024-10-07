const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import("discord.js").Sticker} oldSticker
 * @param {import("discord.js").Sticker} newSticker
 */
module.exports = async (client, oldSticker, newSticker) => {
  const settings = await getSettings(newSticker.guild);
  if (!settings.logging?.emojis) return;

  const logChannel = client.channels.cache.get(settings.logging.emojis);
  if (!logChannel) return;

  const auditLog = await newSticker.guild.fetchAuditLogs({ type: AuditLogEvent.StickerUpdate, limit: 1 });
  const entry = auditLog.entries.first();
  const executor = entry?.target?.id === newSticker.id ? entry.executor : null;

  const changes = [];
  if (oldSticker.name !== newSticker.name) changes.push(`**Name:** \`${oldSticker.name}\` ➔ \`${newSticker.name}\``);
  if (oldSticker.description !== newSticker.description)
    changes.push(`**Description:** \`${oldSticker.description}\` ➔ \`${newSticker.description}\``);
  if (oldSticker.tags !== newSticker.tags) changes.push(`**Tags:** \`${oldSticker.tags}\` ➔ \`${newSticker.tags}\``);

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Sticker Updated" })
    .setColor("Yellow")
    .setDescription(`Sticker **${newSticker.name}** was updated`)
    .addFields(
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
    .setFooter({ text: `ID: ${newSticker.id}` });

  logChannel.send({ embeds: [embed] });
};
