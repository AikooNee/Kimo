const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "247",
  description: "toggle 24/7 mode",
  category: "MUSIC",
  userPermissions: ["ManageGuild"],
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["stay"],
    minArgsCount: 0,
    usage: "",
  },
  slashCommand: {
    enabled: true,
    options: [],
  },

  async messageRun(message, args, data) {
    const response = await toggle247(message, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await toggle247(interaction, data.settings);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {Object} settings
 */
async function toggle247({ client, guild }, settings) {
  const is247 = settings.music.stay.enabled;

  settings.music.stay.enabled = !is247;
  await settings.save();

  const description = `24/7 mode is now ${!is247 ? "enabled" : "disabled"}`;
  const embed = new EmbedBuilder()
    .setColor(client.config.EMBED_COLORS.BOT_EMBED)
    .setDescription(description);

  return { embeds: [embed] };
}