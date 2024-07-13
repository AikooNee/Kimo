
module.exports = {
  OWNER_IDS: ["1165609918326382656"], // Bot owner ID's
  SUPPORT_SERVER: "https://aarubot.xyz/support", // Your bot support server
  PREFIX_COMMANDS: {
    ENABLED: true, // Enable/Disable prefix commands
    DEFAULT_PREFIX: "+", // Default prefix for the bot
  },
  INTERACTIONS: {
    SLASH: true, // Should the interactions be enabled
    CONTEXT: true, // Should contexts be enabled
    GLOBAL: true, // Should the interactions be registered globally
    TEST_GUILD_ID: "xxxxxxxxxxx", // Guild ID where the interactions should be registered. [** Test your commands here first **]
  },
  EMBED_COLORS: {
    BOT_EMBED: "#79F0FF",
    TRANSPARENT: "#36393F",
    SUCCESS: "#00A56A",
    ERROR: "#D61A3C",
    WARNING: "#F7E919",
  },
  CACHE_SIZE: {
    GUILDS: 100,
    USERS: 10000,
    MEMBERS: 10000,
  },
  MESSAGES: {
    API_ERROR: "Unexpected Backend Error! Try again later or contact support server",
  },

  // PLUGINS
  AUTOMOD: {
    ENABLED: true,
    LOG_EMBED: "#36393F",
    DM_EMBED: "#36393F",
  },

  MUSIC: {
    ENABLED: true,
    IDLE_TIME: 120, // Time in seconds before the bot disconnects from an idle voice channel
    MAX_SEARCH_RESULTS: 5,
    DEFAULT_VOLUME: 60, // Default volume for the music player (0-100)
    DEFAULT_SOURCE: "ytsearch", // ytsearch = Youtube, ytmsearch = Youtube Music, spsearch = Spotify, scsearch = SoundCloud
    // Lavalink WebSocket configuration
    LAVALINK_WS: {
      clientName: "Kimo", // The name of the Lavalink client.
      resuming: true, // Whether Lavalink should attempt to resume existing sessions when reconnecting.
      reconnecting: {
        tries: 10, // Number of times to attempt reconnecting.
        delay: 20000 // Delay in milliseconds between each reconnection attempt.
      }
    },
    // Add any number of Lavalink nodes here
    LAVALINK_NODES: [
      {
        info: {
          host: "private.aarubot.xyz",
          auth: "Secret 😋",
          port: 443,
        },
        identifier: "Kimo",
      },
    ],
  },
    
  GIVEAWAYS: {
    ENABLED: true,
    REACTION: "🎁",
    START_EMBED: "#FF468A",
    END_EMBED: "#FF468A",
  },

  INVITE: {
    ENABLED: true,
  },

  MODERATION: {
    ENABLED: true,
    EMBED_COLORS: {
      TIMEOUT: "#102027",
      UNTIMEOUT: "#4B636E",
      KICK: "#FF7961",
      SOFTBAN: "#AF4448",
      BAN: "#D32F2F",
      UNBAN: "#00C853",
      VMUTE: "#102027",
      VUNMUTE: "#4B636E",
      DEAFEN: "#102027",
      UNDEAFEN: "#4B636E",
      DISCONNECT: "RANDOM",
      MOVE: "RANDOM",
    },
  },

  PRESENCE: {
    ENABLED: true, // Whether or not the bot should update its status
    STATUS: "online", // The bot's status [online, idle, dnd, invisible]
    TYPE: "LISTENING", // Status type for the bot [PLAYING | LISTENING | WATCHING | COMPETING]
    MESSAGE: "Sensei <3", // Your bot status message
  },

  STATS: {
    ENABLED: true,
    XP_COOLDOWN: 5, // Cooldown in seconds between messages
    DEFAULT_LVL_UP_MSG: "{member:mention}, You just advanced to **Level {level}**",
  },
};