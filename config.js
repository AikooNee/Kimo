
module.exports = {
  OWNER_IDS: ["1165609918326382656"],
  SUPPORT_SERVER: "",
  PREFIX_COMMANDS: {
    ENABLED: true,
    DEFAULT_PREFIX: "+",
  },
  INTERACTIONS: {
    SLASH: true,
    CONTEXT: true,
    GLOBAL: true,
    TEST_GUILD_ID: "", 
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

  AI_CHAT: {
    ENABLED: true,
    MODEL: "gemini-1.5-flash",
    DEFAULT_LANG: "en",
    TRANSLATE: true,
    COOLDOWN: 10,
    ANTI_LINKS: false,
    MAX_HISTORY: 6,
  },
 
  AUTOMOD: {
    ENABLED: true,
    LOG_EMBED: "#36393F",
    DM_EMBED: "#36393F",
  },

  MUSIC: {
    ENABLED: true,
    IDLE_TIME: 120,
    DEFAULT_VOLUME: 80,
    DEFAULT_ENGINE: "spsearch",
    LAVALINK_NODES: [
      {
        id: "Local Node",
        host: "localhost",
        port: 2333,
        authorization: "youshallnotpass",
        secure: false,
        retryAmount: 20,
        retryDelay: 30000,
      },
    ],
  },
    
  GIVEAWAYS: {
    ENABLED: true,
    REACTION: "🎉",
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

  STATS: {
    ENABLED: true,
    XP_COOLDOWN: 5,
    DEFAULT_LVL_UP_MSG: "{member:mention}, You just advanced to **Level {level}**",
  },
};