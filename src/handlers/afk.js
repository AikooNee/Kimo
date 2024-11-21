const { EmbedBuilder } = require("discord.js");
const { timeformat } = require("@helpers/Utils");
const { EMBED_COLORS } = require("@root/config");

const afk = async (client, message, settings) => {
  if (!message.guild || message.author.bot) return;

  const afkEntry = settings.afk.find((a) => a.userId === message.author.id);

  if (afkEntry && afkEntry.status === true) {
    const duration = Math.floor((Date.now() - new Date(afkEntry.afktime)) / 1000);

    if (duration >= 2) {
      let description = `Welcome back, <@${message.author.id}>! You were away for ${timeformat(duration)}`;

      if (afkEntry.msglink && afkEntry.msglink.length > 0) {
        description += "\n\nWhile you were away, you received the following messages";
        afkEntry.msglink.forEach((msg, index) => {
          description += `\n[[Message ${index + 1}]](${msg})`;
        });
      }

      settings.afk = settings.afk.filter((a) => a.userId !== message.author.id);
      await settings.save();

      return message.safeReply({
        embeds: [
          new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(description),
        ],
      });
    }
  }

  const mentions = message.mentions.members;
  for (const [_, user] of mentions) {
    const afkCheck = settings.afk.find((a) => a.userId === user.id);

    if (afkCheck && afkCheck.status === true) {
      const duration = Math.floor((Date.now() - new Date(afkCheck.afktime)) / 1000);
      const description = `<@${user.id}> has been AFK for ${timeformat(duration)}.\nReason: ${afkCheck.reason}`;

      await message.safeReply({
        embeds: [
          new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(description),
        ],
      });

      const messageLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
      afkCheck.msglink.push(messageLink);
      await settings.save();
    }
  }
};

module.exports = { afk };
