const { 
  EmbedBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ActionRowBuilder, 
  GatewayDispatchEvents 
} = require("discord.js");
const { Cluster } = require("lavaclient");
const { getSettings } = require("@schemas/Guild");
require("@lavaclient/plugin-queue/register");

let history = new Map();

/**
 * @param {import("@structures/BotClient")} client
 */
module.exports = (client) => {
  const lavaclient = new Cluster({
    nodes: client.config.MUSIC.LAVALINK_NODES,
    ws: client.config.MUSIC.LAVALINK_WS,
    discord: {
      sendGatewayCommand: (id, payload) => client.guilds.cache.get(id)?.shard?.send(payload),
    },
  });

  client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (data) => lavaclient.players.handleVoiceUpdate(data));
  client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (data) => lavaclient.players.handleVoiceUpdate(data));

  // Buttons for music player controls
  let bPause = new ButtonBuilder()
    .setCustomId("Button_Pause")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("⏸️");
  let bSkip = new ButtonBuilder()
    .setCustomId("Button_Skip")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("⏭️");
  let bStop = new ButtonBuilder()
    .setCustomId("Button_Stop")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("⏹");
  let bLoop = new ButtonBuilder()
    .setCustomId("Button_Loop")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("🔁");
  let bShuffle = new ButtonBuilder()
    .setCustomId("Button_Shuffle")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("🔀");

  const buttonRow = new ActionRowBuilder()
    .addComponents(bLoop, bPause, bStop, bSkip, bShuffle);

  lavaclient.on("nodeConnected", (node) => {
    client.logger.log(`Node "${node.identifier}" connected`);
  });

  lavaclient.on("nodeDisconnected", (node) => {
    client.logger.log(`Node "${node.identifier}" disconnected`);
  });

  lavaclient.on("nodeError", (node, error) => {
    client.logger.error(`Node "${node.identifier}" encountered an error: ${error.message}.`, error);
  });

  lavaclient.on("nodeDebug", (node, event) => {
    client.logger.debug(`Node "${node.identifier}" debug: ${event.message}`);
  });

  lavaclient.on("nodeTrackStart", async (_node, queue, track) => {
    const fields = [];
    const embed = new EmbedBuilder()
      .setAuthor({ name: "Now Playing" })
      .setColor(client.config.EMBED_COLORS.BOT_EMBED)
      .setDescription(`[${track.info.title}](${track.info.uri})`)
      .setFooter({ text: `Requested By: ${track.requesterId}` })
      .setThumbnail(track.info.artworkUrl);

    fields.push({
      name: "Song Duration",
      value: "`" + client.utils.formatTime(track.info.length) + "`",
      inline: true,
    });

    if (queue.tracks.length > 0) {
      fields.push({
        name: "Position in Queue",
        value: (queue.tracks.length + 1).toString(),
        inline: true,
      });
    }

    embed.addFields(fields);
    const message = await queue.data.channel.send({ embeds: [embed], components: [buttonRow] });
    queue.data.messageIds = message;

    await client.wait(1000); // Wait a second
    await client.utils.vcUpdate(queue.player.voice.channelId, `Playing **${track.info.title}**`, client);
  });

  const handleConclude = async (queue) => {
    const message = queue.data.messageIds;
    if (message) {
      await message.delete().catch(() => {});
    }

    const guildId = queue.data.channel.guildId;
    const guild = client.guilds.cache.get(guildId);
    const settings = await getSettings(guild);
    const player = lavaclient.players.resolve(guildId);

    if (player && player.autoplay) {
      await autoplay(client, guildId);
    } else {
      if (settings.music.stay.enabled) {
        const embed = new EmbedBuilder()
          .setColor(client.config.EMBED_COLORS.BOT_EMBED)
          .setTitle("Queue Ended")
          .setDescription("Queue has ended. **24/7 mode is on so I haven't left.**");
        const message = await queue.data.channel.send({ embeds: [embed] });
        
        setTimeout(() => {
          if (message.deletable) message.delete().catch(() => {});
        }, 30000);
      } else {
        const embed = new EmbedBuilder()
          .setColor(client.config.EMBED_COLORS.BOT_EMBED)
          .setTitle("Queue Concluded")
          .setDescription("Enjoying music with me? Consider [**Inviting**](https://aarubot.xyz/invite) me");

        const conclude = await queue.data.channel.send({ embeds: [embed] });

        setTimeout(() => {
          conclude.delete().catch(() => {});
        }, 20000);

        await client.musicManager.players.destroy(guildId).then(() => queue.player.voice.disconnect());
      }
    }

    await client.utils.vcUpdate(queue.player.voice.channelId, '', client);
  };

  lavaclient.on("nodeQueueFinish", async (_node, queue) => {
    await handleConclude(queue);
  });

  lavaclient.on('playerDestroy', async (player) => {
    const queue = player.queue;
    if (queue) {
      await handleConclude(queue);
    }
  });

  lavaclient.on('playerPaused', async (player, track) => {
    await client.utils.vcUpdate(player.voice.channelId, `Paused **${track.info.title}**`, client);
  });

  lavaclient.on('playerResumed', async (player, track) => {
    await client.utils.vcUpdate(player.voice.channelId, `Playing **${track.info.title}**`, client);
  });

  async function autoplay(client, guildId) {
    const player = lavaclient.players.resolve(guildId);
    const song = player.queue.current;

    const identifier = song ? song.info.identifier : null;
    let url;

    switch (song.info?.sourceName) {
      case "spotify":
        url = `sprec:seed_tracks=${identifier || "6IklmB1n2kIu4TvJDLb4Ss"}&limit=20&min_popularity=40`;
        break;
      case "youtube":
        url = `https://youtube.com/watch?v=${identifier || "lpeuIu-ZYJY"}&list=RD${identifier || "lpeuIu-ZYJY"}`;
        break;
      default:
        url = `ytsearch:${song.info?.author}`;
    }

    const res = await lavaclient.api.loadTracks(url);
    if (!res || !res.data) {
      return lavaclient.players.destroy(guildId);
    }

    const metadata = Array.isArray(res.data.tracks) ? res.data.tracks : res.data;
    const maxtry = 14;
    let pick = null;
    let count = 0;

    if (!history.has(guildId)) {
      history.set(guildId, []);
    }
    const songHistory = history.get(guildId);

    while (count < maxtry) {
      const aspiringChoice = metadata[Math.floor(Math.random() * metadata.length)];
      if (!(player.queue.tracks.some((s) => s.encoded === aspiringChoice.encoded) ||
        songHistory.some((s) => s.encoded === aspiringChoice.encoded))) {
        pick = aspiringChoice;
        break;
      }
      count++;
    }

    if (pick) {
      player.queue.add(pick, { requester: client.user.displayName });
      songHistory.push(pick); // Add the song in history after adding to queue
      const started = player.playing || player.paused;
      if (!started) {
        await player.queue.start();
      }
    } else {
      return lavaclient.players.destroy(guildId);
    }
  }
  
  client.autoplay = autoplay;

  return lavaclient;
};