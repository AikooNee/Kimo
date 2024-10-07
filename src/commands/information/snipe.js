const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const Policy = require("@schemas/Policy");

module.exports = {
  name: "snipe",
  description: "Retrieve the last deleted message from a channel",
  cooldown: 3,
  category: "INFORMATION",
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

  async messageRun(message, args, data) {
    const response = await getSnipe(message, data, message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await getSnipe(interaction, data, interaction.user);
    if (response) await interaction.followUp(response);
    else interaction.deleteReply();
  },
};

async function getSnipe(context, data, user) {
  const policy = await Policy.findOne({ userId: user.id });

  if (!policy || !policy.accepted) {
    let btn = [];
    btn.push(new ButtonBuilder().setCustomId("accept").setStyle(ButtonStyle.Success).setLabel("Accept"));
    btn.push(new ButtonBuilder().setCustomId("reject").setStyle(ButtonStyle.Danger).setLabel("Reject"));

    const row = new ActionRowBuilder().addComponents(btn);
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(
        "- By accepting this policy, you acknowledge the ability to utilize this command. Additionally, you agree to allow the bot to archive your deleted messages\n" +
          "- However, rejecting this policy indicates the forfeiture of access to the snipe command and ensures that the bot will not store your deleted messages.\n\n" +
          "- Note: All stored messages are promptly purged upon command usage."
      )
      .setFooter({ text: "This action will expire in 20 seconds" });

    const m = await context.channel.safeSend({ embeds: [embed], components: [row] });

    const collector = context.channel.createMessageComponentCollector({
      filter: (reactor) => reactor.user.id === user.id,
      time: 20000,
    });

    collector.on("collect", async (response) => {
      if (response.customId === "accept") {
        await Policy.findOneAndUpdate({ userId: user.id }, { accepted: true }, { upsert: true });
        const embed = new EmbedBuilder()
          .setColor(EMBED_COLORS.SUCCESS)
          .setDescription(
            "You have accepted the snipe policy. You can now use the snipe command to view last deleted messages."
          );
        await m.edit({ embeds: [embed], components: [] });
      } else if (response.customId === "reject") {
        const embed = new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription(
            "You have rejected the snipe policy. You cannot use the snipe command to view last deleted messages"
          );
        await m.edit({ embeds: [embed], components: [] });
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        const embed = new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription("No response received. The policy action has expired.");
        m.edit({ embeds: [embed], components: [] });
      }
    });
    return;
  }

  const settings = data.settings;
  if (!settings.snipe || settings.snipe.channel !== context.channel.id || !settings.snipe.content) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("No message has been deleted in this channel.");
    return { embeds: [embed] };
  }

  const content =
    settings.snipe.content.length > 1000 ? `${settings.snipe.content.substring(0, 1000)}...` : settings.snipe.content;
  const embed = new EmbedBuilder()
    .setTimestamp(new Date(settings.snipe.deletedAt))
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: `${settings.snipe.username}`, iconURL: settings.snipe.userAvatar })
    .addFields({ name: "Content", value: content }, { name: "Channel", value: `<#${settings.snipe.channel}>` })
    .setThumbnail(settings.snipe.userAvatar);

  settings.snipe = null;
  await settings.save();

  return { embeds: [embed] };
}
