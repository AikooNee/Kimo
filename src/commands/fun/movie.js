const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const axios = require("axios");

module.exports = {
  name: "movie",
  description: "Search for a movie or get details using the movie name",
  cooldown: 10,
  category: "FUN",
  botPermissions: ["EmbedLinks"],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: [],
    usage: "<movie name>",
    minArgsCount: 0,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "name",
        description: "Name of the movie",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const choice = args.join(" ");
    if (!choice) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setDescription("Please provide the name of the movie.");
      return message.safeReply({ embeds: [embed] });
    }
    const response = await getMovie(message, choice);
    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("name");
    const response = await getMovie(interaction, choice);
    await interaction.followUp(response);
  },
};

async function getMovie(user, choice) {
  const response = await axios.get(`
    http://www.omdbapi.com/?apikey=${process.env.OMDAPI_KEY}&t=${encodeURIComponent(choice)}`);
  const movie = response.data;
  if (movie.Response === "False") {
    const embed = new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription("Movie not found!");
    return { embeds: [embed] };
  }

  const embed = new EmbedBuilder()
    .setTitle(movie.Title || "N/A")
    .setDescription(movie.Plot ? movie.Plot : "No overview available.")
    .addFields(
      { name: "Released", value: movie.Released || "N/A", inline: true },
      { name: "Runtime", value: movie.Runtime || "N/A", inline: true },
      { name: "Director", value: movie.Director || "N/A", inline: true },
      { name: "Actors", value: movie.Actors || "N/A", inline: true },
      { name: "Language", value: movie.Language || "N/A", inline: true },
      { name: "Country", value: movie.Country || "N/A", inline: true },
      { name: "Awards", value: movie.Awards || "N/A", inline: true },
      { name: "BoxOffice", value: movie.BoxOffice || "N/A", inline: true }
    )
    .setThumbnail(movie.Poster !== "N/A" ? movie.Poster : "")
    .setColor(EMBED_COLORS.BOT_EMBED);

  return { embeds: [embed] };
}
