const { getSettings } = require("@schemas/Guild");

module.exports = async (client, node) => {
  client.logger.success(`Node ${node.id} is ready!`);

  node.updateSession(true, 360e3);

  let count = 0;

  for (const guild of client.guilds.cache.values()) {
    const settings = await getSettings(guild);
    if (!settings) continue;

    const { textId, voiceId } = settings.music.stay;

    const channel = guild.channels.cache.get(textId);
    const vc = guild.channels.cache.get(voiceId);

    if (channel && vc) {
      const player = await client.manager.createPlayer({
        guildId: guild.id,
        voiceChannelId: vc.id,
        textChannelId: channel.id,
        selfDeaf: true,
        selfMute: false,
      });

      if (!player.connected) {
        await player.connect();
        count++;
      }
    }
  }
  client.logger.log(`Reconnected to ${count} guilds`);
};
