const { LavalinkManager } = require("lavalink-client");
const { MUSIC } = require("@root/config.js");

class Manager extends LavalinkManager {
  constructor(client) {
    super({
      nodes: MUSIC.LAVALINK_NODES,
      sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
      emitNewSongsOnly: false,
      queueOptions: {
        maxPreviousTracks: 30,
      },
      playerOptions: {
        defaultSearchPlatform: MUSIC.DEFAULT_ENGINE,
        onDisconnect: {
          autoReconnect: true,
          destroyPlayer: false,
        },
        onEmptyQueue: {},
      },
      linksAllowed: true,
      linksBlacklist: ["porn"],
      linksWhitelist: [],
    });
  }
}

module.exports = Manager;
