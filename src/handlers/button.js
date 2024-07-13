const { EMBED_COLORS } = require("@root/config");
const { LoopType } = require("@lavaclient/plugin-queue");
const { EmbedBuilder } = require("discord.js");

async function sendReply(interaction, content) {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(content);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function pauseButton(client, interaction) {
  if (!interaction.member.voice.channel) {
    return sendReply(interaction, "🚫 No music is being played!");
  }

  if (!interaction.guild.members.me.voice.channel) {
    return sendReply(interaction, "🚫 You need to join my voice channel.");
  }

  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return sendReply(interaction, "🚫 You're not in the same voice channel.");
  }

  const player = client.musicManager.players.resolve(interaction.guildId);

  if (!player.paused) {
    await player.pause();
    return sendReply(interaction, "⏸️ Paused the music player.");
  }

  if (player.paused) {
    await player.resume();
    return sendReply(interaction, "▶️ Resumed the music player");
  }
}

async function skipButton(client, interaction) {
  if (!interaction.member.voice.channel) {
    return sendReply(interaction, "🚫 No music is being played!");
  }

  if (!interaction.guild.members.me.voice.channel) {
    return sendReply(interaction, "🚫 You need to join my voice channel.");
  }

  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return sendReply(interaction, "🚫 You're not in the same voice channel.");
  }

  const player = client.musicManager.players.resolve(interaction.guildId);
  const title = player.queue.current.info.title;

  if (player.queue.tracks.length === 0) {
    return sendReply(interaction, "There is no next song to skip to.");
  }

  player.queue.next();
  return sendReply(interaction, `⏯️ ${title} was skipped successfully.`);
}

async function stopButton(client, interaction) {
  if (!interaction.member.voice.channel) {
    return sendReply(interaction, "🚫 No music is being played!");
  }

  if (!interaction.guild.members.me.voice.channel) {
    return sendReply(interaction, "🚫 You need to join my voice channel.");
  }

  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return sendReply(interaction, "🚫 You're not in the same voice channel.");
  }

  const player = client.musicManager.players.resolve(interaction.guildId);

  if (player.playing) {
    player.voice.disconnect();
    await client.musicManager.players.destroy(interaction.guildId);
    return sendReply(interaction, "🎶 The music player is stopped, and the queue has been cleared");
  }
}

async function loopButton(client, interaction) {
  if (!interaction.member.voice.channel) {
    return sendReply(interaction, "🚫 No music is being played!");
  }

  if (!interaction.guild.members.me.voice.channel) {
    return sendReply(interaction, "🚫 You need to join my voice channel.");
  }

  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return sendReply(interaction, "🚫 You're not in the same voice channel.");
  }

  const player = client.musicManager.players.resolve(interaction.guildId);

  // Looping Track
  if (player.queue.loop.type === 0) {
    player.queue.setLoop(LoopType.Song);
    return sendReply(interaction, "Loop mode is set to `track`");
  }

  // Looping Queue
  if (player.queue.loop.type === 2) {
    player.queue.setLoop(LoopType.Queue);
    return sendReply(interaction, "Loop mode is set to `queue`");
  }

  // Turn OFF Looping
  if (player.queue.loop.type === 1) {
    player.queue.setLoop(LoopType.None);
    return sendReply(interaction, "Loop mode is set to `none`");
  }
}

async function shuffleButton(client, interaction) {
  if (!interaction.member.voice.channel) {
    return sendReply(interaction, "🚫 No music is being played!");
  }

  if (!interaction.guild.members.me.voice.channel) {
    return sendReply(interaction, "🚫 You need to join my voice channel.");
  }

  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return sendReply(interaction, "🚫 You're not in the same voice channel.");
  }

  const player = client.musicManager.players.resolve(interaction.guildId);
  player.queue.shuffle();

  return sendReply(interaction, "🎶 Queue has been shuffled");
}

module.exports = {
  pauseButton,
  skipButton,
  stopButton,
  loopButton,
  shuffleButton,
};