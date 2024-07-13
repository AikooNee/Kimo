const config = require("@root/config");

module.exports = {
  ADMIN: {
    name: "Admin",
    image: "https://cdn.discordapp.com/emojis/1215966509181173832.png",
    emoji: "<:a_admin:1215966509181173832>",
  },
  AUTOMOD: {
    name: "Automod",
    enabled: config.AUTOMOD.ENABLED,
    image: "https://cdn.discordapp.com/emojis/1215966646976647168.png",
    emoji: "<:a_automod:1215966646976647168>",
  },
   ANIME: {
    name: "Anime",
    image: "https://wallpaperaccess.com/full/5680679.jpg",
    emoji: "🎨",
  },
    FUN: {
    name: "Fun",
    image: "https://cdn.discordapp.com/emojis/1215966551371550770.png",
    emoji: "<:a_fun:1215966551371550770>",
  },
  GIVEAWAY: {
    name: "Giveaway",
    enabled: config.GIVEAWAYS.ENABLED,
    image: "https://cdn.discordapp.com/emojis/1215968944855322666.png",
    emoji: "<:a_gift:1215968944855322666>",
  },
  INVITE: {
    name: "Invite",
    enabled: config.INVITE.ENABLED,
    image: "https://cdn.discordapp.com/emojis/1215968910151651428.png",
    emoji: "<:a_invite:1215968910151651428>",
  },
  INFORMATION: {
    name: "Information",
    image: "https://cdn.discordapp.com/emojis/1215966490898075779.png",
    emoji: "<:a_info:1215966490898075779>",
  },
  MODERATION: {
    name: "Moderation",
    enabled: config.MODERATION.ENABLED,
    image: "https://cdn.discordapp.com/emojis/1215968928254132244.png",
    emoji: "<:a_moderation:1215968928254132244>",
  },
  MUSIC: {
    name: "Music",
    enabled: config.MUSIC.ENABLED,
    image: "https://cdn.discordapp.com/emojis/1215966626051002368.png",
    emoji: "<:a_music:1215966626051002368>",
  },
  OWNER: {
    name: "Owner",
    image: "https://www.pinclipart.com/picdir/middle/531-5318253_web-designing-icon-png-clipart.png",
    emoji: "🤴",
  },
  STATS: {
    name: "Statistics",
    enabled: config.STATS.ENABLED,
    image: "https://cdn.discordapp.com/emojis/1215966532589322323.png",
    emoji: "<:a_stats:1215966532589322323>",
  },
  UTILITY: {
    name: "Utility",
    image: "https://cdn.discordapp.com/emojis/1215966585001607238.png",
    emoji: "<:a_utility:1215966585001607238>",
  },
};
