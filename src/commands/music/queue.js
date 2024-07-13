const { EMBED_COLORS } = require("@root/config");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "queue",
  description: "displays the current music queue",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["q"],
    usage: "[page]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "page",
        description: "page number",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const page = args.length && Number(args[0]) ? Number(args[0]) : 1;
    const response = await getQueue(message, page);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const page = interaction.options.getInteger("page");
    const response = await getQueue(interaction, page);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {number} pgNo
 */
async function getQueue({ client, guild }, pgNo) {
  const player = client.musicManager.players.resolve(guild.id);
  if (!player) return "🚫 There is no music playing in this guild.";

  const queue = player.queue;
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: `Queue for ${guild.name}` });

  // change for the amount of tracks per page
  const multiple = 10;
  const page = pgNo || 1;

  const end = page * multiple;
  const start = end - multiple;

  const tracks = queue.tracks.slice(start, end);

  if (queue.current) {
    const currentTrack = queue.current;
    embed.addFields({ 
      name: "Current", 
      value: `[${currentTrack.info.title}](${currentTrack.info.uri}) \`[${client.utils.formatTime(currentTrack.info.length)}]\`` 
    });
  }

  const queueList = tracks.map((track, index) => {
    const title = track.info.title;
    const uri = track.info.uri;
    const duration = client.utils.formatTime(track.info.length);
    return `${start + index + 1}. [${title}](${uri}) \`[${duration}]\``;
  });

  if (!queueList.length) {
    embed.setDescription(`No tracks in ${page > 1 ? `page ${page}` : "the queue"}.`);
  } else {
    embed.setDescription(queueList.join("\n"));
  }

  const maxPages = Math.ceil(queue.tracks.length / multiple);
  embed.setFooter({ text: `Page ${page > maxPages ? maxPages : page} of ${maxPages}` });

  return { embeds: [embed] };
}