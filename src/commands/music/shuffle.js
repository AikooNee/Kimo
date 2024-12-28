const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "shuffle",
  description: "shuffle the queue",
  category: "MUSIC",
  validations: musicValidations,
  slashCommand: {
    enabled: true,
  },

  async interactionRun(interaction) {
    const response = shuffle(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
function shuffle({ client, guildId }) {
  const player = client.manager.getPlayer(guildId);

  if (!player) return "🚫 There is no music player for this guild";

  if (player.queue.tracks.length < 2) {
    return "🚫 Not enough tracks to shuffle";
  }

  player.queue.shuffle();
  return "🎶 Queue has been shuffled";
}
