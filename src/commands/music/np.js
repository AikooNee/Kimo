const { EMBED_COLORS } = require("@root/config");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { Classic } = require("musicard");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "np",
  description: "show's what track is currently being played",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["nowplaying"],
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = await nowPlaying(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await nowPlaying(interaction);
    await interaction.followUp(response);
  },
};

async function nowPlaying({ client, guildId}) {
  const player = client.musicManager.players.resolve(guildId);
  if (!player || !player.queue.current) return "No music is being played!";

  const track = player.queue.current;
  const duration = track.info.length;
  const position = player.position;

  const musicard = await Classic({
    thumbnailImage: track.info.artworkUrl,
    backgroundColor: "#070707",
    progress: (position / duration) * 100,
    progressColor: "#79F0FF",
    progressBarColor: "#696969",
    name: track.info.title,
    nameColor: "#79F0FF",
    author: `By ${track.info.author}`,
    authorColor: "#696969",
    startTime: client.utils.formatTime(position),
    endTime: client.utils.formatTime(duration),
    timeColor: "#696969",
  });

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setAuthor({ name: `Now playing ${track.info.title}` })
    .setImage("attachment://uwu.png")
    .setFooter({ text: `Requested by: ${track.requesterId}` });

  return { embeds: [embed], files: [new AttachmentBuilder(musicard, { name: "uwu.png" })] };
}