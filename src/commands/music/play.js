const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
require("@lavaclient/plugin-queue/register")
const { EMBED_COLORS, MUSIC } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "play",
  description: "play a song from youtube",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["p"],
    usage: "<song-name>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "query",
        description: "song name or url",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const query = args.join(" ");
    const response = await play(message, query);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const query = interaction.options.getString("query");
    const response = await play(interaction, query);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {string} query
 */
async function play({ member, guild, channel }, query) {
  if (!member.voice.channel) return "🚫 You need to join a voice channel first";

  let player = guild.client.musicManager.players.resolve(guild.id);
  if (player && !guild.members.me.voice.channel) {
    player.voice.disconnect();
    await guild.client.musicManager.players.destroy(guild.id);
  }

  if (player && member.voice.channel !== guild.members.me.voice.channel) {
    return "🚫 You must be in the same voice channel as mine";
  }

  let embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED);
  let tracks;
  let description = "";
  let thumbnail;

  try {
    const res = await guild.client.musicManager.api.loadTracks(
      /^https?:\/\//.test(query) ? query : `${MUSIC.DEFAULT_SOURCE}:${query}`
    );

    let track; // Declare track variable outside the switch statement

    switch (res.loadType) {
      case "error":
        guild.client.logger.error("Search Exception", res.data);
        return "🚫 There was an error while searching";

      case "empty":
        return `No results found matching ${query}`;

      case "playlist":
        tracks = res.data.tracks;
        description = res.data.info.name;
        thumbnail = res.data.pluginInfo.artworkUrl;
        break;

      case "track":
        track = res.data;
        tracks = [track];
        break;

      case "search":
        track = res.data[0];
        tracks = [track];
        break;

      default:
        guild.client.logger.debug("Unknown loadType", res);
        return "🚫 An error occurred while searching for the song";
    }

    if (!tracks) guild.client.logger.debug({ query, res });
  } catch (error) {
    guild.client.logger.error("Search Exception", typeof error === "object" ? JSON.stringify(error) : error);
    return "🚫 An error occurred while searching for the song";
  }

  if (!tracks) return "🚫 An error occurred while searching for the song";

  if (tracks.length === 1) {
    const track = tracks[0];
    if (!player?.playing && !player?.paused && !player?.queue.tracks.length) {
      embed.setAuthor({ name: "Added Track to queue" });
    } else {
      const fields = [];
      embed
        .setAuthor({ name: "Added Track to queue" })
        .setDescription(`[${track.info.title}](${track.info.uri})`)
        .setThumbnail(track.info.artworkUrl)
        .setFooter({ text: `Requested By: ${member.user.username}` });

      fields.push({
        name: "Song Duration",
        value: "`" + guild.client.utils.formatTime(track.info.length) + "`",
        inline: true,
      });

      if (player?.queue?.tracks?.length > 0) {
        fields.push({
          name: "Position in Queue",
          value: (player.queue.tracks.length + 1).toString(),
          inline: true,
        });
      }
      embed.addFields(fields);
    }
  } else {
    embed
      .setAuthor({ name: "Added Playlist to queue" })
      .setThumbnail(thumbnail)
      .setDescription(description)
      .addFields(
        {
          name: "Enqueued",
          value: `${tracks.length} songs`,
          inline: true,
        },
        {
          name: "Playlist duration",
          value:
            "`" +
            guild.client.utils.formatTime(
              tracks.map((t) => t.info.length).reduce((a, b) => a + b, 0),
            ) +
            "`",
          inline: true,
        }
      )
      .setFooter({ text: `Requested By: ${member.user.username}` });
  }

  // create a player and/or join the member's vc
  if (!player?.connected) {
    player = guild.client.musicManager.players.create(guild.id);
    player.queue.data.channel = channel;
    player.voice.connect(member.voice.channel.id, { deafened: true });
    player.setVolume(MUSIC.DEFAULT_VOLUME);
  }

  // do queue things
  const started = player.playing || player.paused;
  player.queue.add(tracks, { requester: member.user.displayName, next: false });
  if (!started) {
    await player.queue.start();
  }

  return { embeds: [embed] };
}