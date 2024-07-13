const { musicValidations } = require("@helpers/BotUtils");
const { EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "autoplay",
  description: "Toggle autoplay feature for music player",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
    aliases: ["ap"],
    usage: "",
  },
  slashCommand: {
    enabled: true,
    options: [],
  },

  async messageRun(message, args) {
    const response = await toggleAutoplay(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await toggleAutoplay(interaction);
    await interaction.followUp(response);
  },
};

async function toggleAutoplay({ client, guildId }) {
  const player = client.musicManager.players.resolve(guildId);
  const isAutoplay = player.autoplay;

  player.autoplay = !isAutoplay;

  const description = `Autoplay has been ${!isAutoplay ? "enabled" : "disabled"}.`;
  const embed = new EmbedBuilder()
    .setColor(client.config.EMBED_COLORS.BOT_EMBED)
    .setDescription(description);

  return { embeds: [embed] };
}