const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "resume",
  description: "resumes the music player",
  category: "MUSIC",
  validations: musicValidations,
  slashCommand: {
    enabled: true,
  },

  async interactionRun(interaction) {
    const response = resumePlayer(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
function resumePlayer({ client, guildId }) {
  const player = client.manager.getPlayer(guildId);
  if (!player.paused) return "The player is already resumed";
  player.resume();
  return "▶️ Resumed the music player";
}
