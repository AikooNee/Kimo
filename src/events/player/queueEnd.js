const { MUSIC, EMBED_COLORS } = require("@root/config");
const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, player) => {
  const guild = client.guilds.cache.get(player.guildId);
  if (!guild) return;

  const settings = await getSettings(guild);

  if (player.voiceChannelId) {
    await client.utils.vcUpdate(
      client,
      player.voiceChannelId,
      settings.music.stay.enabled ? "Silence? Use /play to start the beat!" : ""
    );
  }

  if (player.volume > 100) {
    await player.setVolume(MUSIC.DEFAULT_VOLUME);
  }

  const msg = player.get("message");
  if (msg) {
    await msg.delete().catch(() => {});
  }

  const channel = guild.channels.cache.get(player.textChannelId);
  if (channel) {
    await channel.safeSend(
      {
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLORS.BOT_EMBED)
            .setTitle("Queue Concluded")
            .setDescription("Enjoying music with me? Consider [voting](https://kiimo.me/vote) for me!"),
        ],
      },
      10
    );
  }
};
