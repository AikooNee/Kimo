const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "afk",
  description: "Set your afk status with an optional message",
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "reason",
        description: "The reason for being afk",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async interactionRun(interaction, data) {
    const reason = interaction.options.getString("reason");
    const response = await afkSet(interaction.user, reason, data);
    await interaction.followUp(response);
  },
};

async function afkSet(user, reason, data) {
  data.settings.afk.push({
    userId: user.id,
    status: true,
    reason: reason || "No reason provided",
    afktime: new Date(),
  });

  await data.settings.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`You have been set as afk for: ${reason || "No reason provided"}`);

  return { embeds: [embed] };
}
