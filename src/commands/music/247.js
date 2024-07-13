const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "247",
  description: "toggle 24/7 mode",
  category: "MUSIC",
  userPermissions: ["ManageGuild"],
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["stay"],
    minArgsCount: 0,
    usage: "",
  },
  slashCommand: {
    enabled: true,
    options: [],
  },

  async messageRun(message, args, data) {
    const response = await toggle247(message, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await toggle247(interaction, data.settings);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {Object} settings
 */
async function toggle247({ client, guildId, member, channel }, settings) {
  const is247 = settings.music.stay.enabled;

  // Check if the user is connected to a voice channel
  if (!member.voice?.channelId) {
    const embed = new EmbedBuilder()
      .setColor(client.config.EMBED_COLORS.ERROR)
      .setDescription("You need to be connected to a voice channel to toggle 24/7 mode.");

    return { embeds: [embed] };
  }

  settings.music.stay.enabled = !is247;
  settings.music.stay.channel = !is247 ? member.voice.channel.id : null;
  await settings.save();

  const description = `24/7 mode is now ${!is247 ? "enabled" : "disabled"}`;
  const embed = new EmbedBuilder()
    .setColor(client.config.EMBED_COLORS.BOT_EMBED)
    .setDescription(description);

  if (!is247) {
    let player = client.musicManager.players.resolve(guildId);
    if (!player?.connected) {
      player = client.musicManager.players.create(guildId);
      player.queue.data.channel = channel;
      player.voice.connect(member.voice.channel.id, { deafened: true });
    }
  }

  return { embeds: [embed] };
}
