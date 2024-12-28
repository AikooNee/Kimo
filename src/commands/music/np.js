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
  slashCommand: {
    enabled: true,
  },

  async interactionRun(interaction) {
    const response = await nowPlaying(interaction);
    await interaction.followUp(response);
  },
};

async function nowPlaying({ client, guildId }) {
  const player = client.manager.getPlayer(guildId);
  if (!player || !player.queue.current) return "No music is being played!";

  const track = player.queue.current;

  const musicard = await Classic({
    thumbnailImage: track.info.artworkUrl,
    backgroundColor: "#070707",
    progress: (player.position / track.info.duration) * 100,
    progressColor: "#79F0FF",
    progressBarColor: "#696969",
    name: track.info.title,
    nameColor: "#79F0FF",
    author: `By ${track.info.author}`,
    authorColor: "#696969",
    startTime: client.utils.formatTime(player.position),
    endTime: client.utils.formatTime(track.info.duration),
    timeColor: "#696969",
  });

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setAuthor({ name: `Now playing ${track.info.title}` })
    .setImage("attachment://uwu.png")
    .setFooter({ text: `Requested by: ${track.requester.username}` });

  return { embeds: [embed], files: [new AttachmentBuilder(musicard, { name: "uwu.png" })] };
}
