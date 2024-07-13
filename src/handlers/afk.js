const { EmbedBuilder } = require("discord.js");
const { timeformat } = require("@helpers/Utils");

const afk = async (client, message, settings) => {
  if (!message.guild || message.author.bot) return;

  const userId = message.author.id;
  const afkEntry = settings.afk.find((a) => a.userId === userId);
  const botEmbedColor = client.config.EMBED_COLORS.BOT_EMBED;

  if (afkEntry && afkEntry.status === true) {
    const duration = Math.floor((Date.now() - new Date(afkEntry.afktime)) / 1000);

    if (duration >= 2) {
      let description = `Welcome back, <@${userId}>! You were away for ${timeformat(duration)}`;

      if (afkEntry.msglink && afkEntry.msglink.length > 0) {
        description += "\n\nWhile you were away, you received the following messages";
        afkEntry.msglink.forEach((msg, index) => {
          description += `\n[[Message ${index + 1}]](${msg})`;
        });
      }

      settings.afk = settings.afk.filter((a) => a.userId !== userId);
      await settings.save();

      const embed = new EmbedBuilder()
        .setColor(botEmbedColor)
        .setDescription(description);

      await message.safeReply({ embeds: [embed] });
      return;
    }
  }

  const mentions = message.mentions.members;
  for (const [_, user] of mentions) {
    const afkCheck = settings.afk.find((a) => a.userId === user.id);

    if (afkCheck && afkCheck.status === true) {
      const duration = Math.floor((Date.now() - new Date(afkCheck.afktime)) / 1000);
      const description = `<@${user.id}> has been AFK for ${timeformat(duration)}.\nReason: ${afkCheck.reason}`;

      const embed = new EmbedBuilder()
        .setColor(botEmbedColor)
        .setDescription(description);

      await message.safeReply({ embeds: [embed] });

      const messageLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
      afkCheck.msglink.push(messageLink);
      await settings.save();
    }
  }
};

module.exports = { afk };