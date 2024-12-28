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
  slashCommand: {
    enabled: true,
    options: [],
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

  if (!member.voice?.channelId) {
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(client.config.EMBED_COLORS.ERROR)
          .setDescription("You need to be connected to a voice channel to toggle 24/7 mode"),
      ],
    };
  }

  const { id: voiceId } = member.voice.channel;
  settings.music.stay = {
    enabled: !is247,
    textId: !is247 ? channel.id : null,
    voiceId: !is247 ? voiceId : null,
  };
  await settings.save();

  let player = client.manager.getPlayer(guildId);
  if (!player) {
    player = await client.manager.createPlayer({
      guildId,
      voiceChannelId: voiceId,
      textChannelId: channel.id,
      selfMute: false,
      selfDeaf: true,
    });
  }

  if (!player.connected) {
    await player.connect();
  }

  return {
    embeds: [
      new EmbedBuilder()
        .setColor(client.config.EMBED_COLORS.BOT_EMBED)
        .setDescription(`24/7 mode is now ${!is247 ? "enabled" : "disabled"}`),
    ],
  };
}
