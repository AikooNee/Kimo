const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import("discord.js").Sticker} sticker
 */
module.exports = async (client, sticker) => {
    const settings = await getSettings(sticker.guild);
    if (!settings.logging?.emojis) return;

    const logChannel = client.channels.cache.get(settings.logging.emojis);
    if (!logChannel) return;

    const auditLog = await sticker.guild.fetchAuditLogs({ type: AuditLogEvent.StickerCreate, limit: 1 });
    const entry = auditLog.entries.first();
    const executor = entry?.target?.id === sticker.id ? entry.executor : null;

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Sticker Created" })
        .setColor("Green")
        .setDescription(`Sticker **${sticker.name}** was created`)
        .addFields(
            {
                name: "Executor",
                value: executor ? executor.toString() : "Unknown",
            },
            {
                name: "Sticker ID",
                value: sticker.id,
            }
        )
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
};