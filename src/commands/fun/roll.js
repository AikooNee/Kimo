const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

module.exports = {
  name: "roll",
  description: "Roll a die to get a random number.",
  cooldown: 3,
  category: "FUN",
  botPermissions: ["SendMessages"],
  command: {
    enabled: true,
    usage: "<roll_amount>",
  },
  async messageRun(message, args) {
    const rollAmount = args[0] || 100;
    const response = await rollDice(rollAmount, message.author);
    await message.safeReply(response);
  },
  async interactionRun(interaction) {
    const rollAmount = interaction.options.getInteger("roll_amount") || 100;
    const response = await rollDice(rollAmount, interaction.user);
    await interaction.followUp(response);
  },
};

function rollDice(rollAmount, author) {
  const randomNumber = Math.floor(Math.random() * rollAmount) + 1;
  const embed = new EmbedBuilder()
    .setTitle("**Dice Roll**")
    .setColor(EMBED_COLORS.SUCCESS)
    .setDescription(`You rolled **${randomNumber}** 🎲`)
    .setFooter(`Requested by ${author.username}`);

  return { embeds: [embed] };
}