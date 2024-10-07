const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { GeniusClient } = require("genius.ts");

module.exports = {
  name: "lyrics",
  description: "Get lyrics of a song",
  cooldown: 0,
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["ly"],
    usage: "[song name]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "query",
        type: ApplicationCommandOptionType.String,
        description: "Find lyric of the song",
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const choice = args.join(" ");
    const response = await getLyric(message.author, choice);
    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("query");
    const response = await getLyric(interaction.user, choice);
    await interaction.followUp(response);
  },
};

async function getLyric(user, choice) {
  const genius = new GeniusClient({ accessToken: process.env.GENIUS_API });
  const track = await genius.getSong({ title: choice, authHeader: true, optimizeQuery: true });

  if (!track) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("Song not found, ensure that you entered correct song name");
    return { embeds: [embed] };
  }

  const lyric = await track.getLyrics();
  const lyrics = lyric.length > 4096 ? lyric.slice(0, 4090) + "..." : lyric;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(track.trackArtworkURL())
    .setTitle(`Lyrics for: ${query}`)
    .setDescription(lyrics);

  return { embeds: [embed] };
}
