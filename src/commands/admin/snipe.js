const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = {
  name: "snipe",
  description: "Retrieve the last deleted message from a channel",
  cooldown: 3,
  category: "ADMIN",
  botPermissions: ["SendMessages", "EmbedLinks"],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: [],
    usage: "",
    minArgsCount: 0,
  },
  slashCommand: {
    enabled: true,
    options: [],
  },

  async messageRun(message, _args, data) {
    await message.safeReply(await getSnipe(message, data));
  },

  async interactionRun(interaction, data) {
    const response = await getSnipe(interaction, data);
    if (response) await interaction.followUp(response);
    else interaction.deleteReply();
  },
};

async function getSnipe(context, data) {
  if (!data.settings.snipe || data.settings.snipe.channel !== context.channel.id) {
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription("No message has been deleted in this channel."),
      ],
    };
  }

  const member = context.guild.members.cache.get(data.settings.snipe.userId);
  const embed = new EmbedBuilder()
    .setTimestamp(new Date(data.settings.snipe.deletedAt))
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
    .setThumbnail(member.user.displayAvatarURL({ size: 2048, dynamic: true }));

  if (data.settings.snipe.content) {
    embed.addFields({
      name: "Content",
      value: data.settings.snipe.content.length > 1000
        ? `${data.settings.snipe.content.substring(0, 1000)}...`
        : data.settings.snipe.content,
    });
  }

  if (data.settings.snipe.proxyURL) {
    embed.setImage(data.settings.snipe.proxyURL);
  }

  data.settings.snipe = null;
  await data.settings.save();

  return { embeds: [embed] };
}
