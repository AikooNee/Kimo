const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const { getRandomInt } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "tod",
  description: "Get a random truth or dare question",
  category: "FUN",
  botPermissions: ["SendMessages"],
  cooldown: 3,
  premium: false,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
    options: []
  },

  async messageRun(message) {
    const response = await getTod(message.author);
    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await getTod(interaction.user);
    await interaction.followUp(response);
  },
};

async function getTod(author) {
  const choice = ["truth", "dare"];
  const tod = getRandomInt(choice.length);
  const uwu = choice[tod];

  const response = await fetch(`${process.env.TOD_API_URL}${uwu}`);
  const data = await response.json();

  if (!data || !data.question) {
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setDescription("Failed to fetch truth or dare question. Please try again later.");
    return { embeds: [embed] };
  }

  const embed = new EmbedBuilder()
    .setColor("Random")
    .setTitle(data.question)
    .setFooter({ text: uwu === 'truth' ? 'Type: Truth' : 'Type: Dare' })
    .setAuthor({
      name: `Requested by ${author.displayName}`,
      iconURL: author.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 }),
    });

  return { embeds: [embed] };
}