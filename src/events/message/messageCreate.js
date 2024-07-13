const { commandHandler, automodHandler, statsHandler } = require("@src/handlers");
const { PREFIX_COMMANDS, EMBED_COLORS } = require("@root/config");
const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder } = require("discord.js");
const { chatbot } = require("@handlers/chatbot");
const { afk } = require('@handlers/afk');

module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  const settings = await getSettings(message.guild);

  if (message.content.startsWith(client.user.toString())) {
    const messageContent = message.content.replace(/<@(!)?\d+>/, '').trim();
    if (!messageContent) {
      const embed = new EmbedBuilder()
        .setTitle("Senpai! What can I do for you?")
        .setThumbnail(client.user.displayAvatarURL({ size: 2048, dynamic: true }))
        .setDescription(`Ahoy, ${message.author}! It seems like you summoned me. My magical prefix is \`${settings.prefix}\`. Invoke \`${settings.prefix}help\` to unveil the secrets of my commands!`)
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setTimestamp();

      message.safeReply({ embeds: [embed] });
      return;
    }
  }

  await chatbot(client, message, settings);

  let isCommand = false;
  if (PREFIX_COMMANDS.ENABLED && message.content.startsWith(settings.prefix)) {
    const invoke = message.content.replace(`${settings.prefix}`, "").split(/\s+/)[0];
    const cmd = client.getCommand(invoke);
    if (cmd) {
      isCommand = true;
      commandHandler.handlePrefixCommand(message, cmd, settings);
    }
  }

  if (settings.stats.enabled) await statsHandler.trackMessageStats(message, isCommand, settings);
  if (!isCommand && !settings.chatbotId) await automodHandler.performAutomod(message, settings);

  afk(client, message, settings);
};