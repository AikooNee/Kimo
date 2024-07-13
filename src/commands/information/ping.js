const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: "ping",
  description: "Checks the bot's latency",
  cooldown: 0,
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  userPermissions: [],
  command: {
    enabled: true,
    usage: "",
    minArgsCount: 0,
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [],
  },

  async messageRun(message, args, data) {
    const msg = await message.safeReply("Pinging...");
    const latency = msg.createdTimestamp - message.createdTimestamp;

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor({
        name: 'Latency Check',
        iconURL: message.client.user.avatarURL({ dynamic: true, size: 2048 }),
      })
      .setDescription(`:heart: Heartbeat: **${message.client.ws.ping}** ms\n:heartpulse: Message: **${latency}** ms\n:sparkles: *Nyan Nyan Nyan!*`);
    
    msg.edit({ content: null, embeds: [embed] });
  },

  async interactionRun(interaction, data) {
    const msg = await interaction.followUp("Pinging...");
    const latency = msg.createdTimestamp - interaction.createdTimestamp;

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor({
        name: 'Latency Check',
        iconURL: interaction.client.user.avatarURL({ dynamic: true, size: 2048 }),
      })
      .setDescription(`:heart: Heartbeat: **${interaction.client.ws.ping}** ms\n:heartpulse: Message: **${latency}** ms\n:sparkles: *Nyan Nyan Nyan!*`);
    
    interaction.editReply({ content: null, embeds: [embed] });
  },
};