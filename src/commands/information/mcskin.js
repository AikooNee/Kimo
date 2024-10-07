const { EMBED_COLORS } = require("@root/config");
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "mcskin",
  description: "Displays Minecraft skin of a player.",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    usage: "<skin-name>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "name",
        description: "Minecraft player's name",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const response = mcskin(message, args[0]);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const name = interaction.options.getString("name");
    const response = mcskin(interaction, name);
    await interaction.followUp(response);
  },
};

function mcskin(context, playerName) {
  const username = playerName.split(" ")[0];
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(`${playerName}'s Minecraft Skin`)
    .setImage(`https://minotar.net/armor/body/${username}/700.png`)
    .setTimestamp();

  return { embeds: [embed] };
}
