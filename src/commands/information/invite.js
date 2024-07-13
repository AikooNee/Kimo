const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config");

module.exports = {
  name: "invite",
  description: "Get an invite link for the bot.",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: [],
    usage: "",
    minArgsCount: 0,
  },
  slashCommand: {
    ephemeral: true,
    enabled: true,
    options: [],
  },

  async messageRun(message, args, data) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: "Invite" })
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(message.client.user.displayAvatarURL())
      .setDescription("Thanks, for giving an invite. Just [Click Me](https://au.aarubot.xyz/invite) or click the below button to help me reach your server");

    let components = [
      new ButtonBuilder().setLabel("Invite Link").setURL("https://au.aarubot.xyz").setStyle(ButtonStyle.Link),
    ];

    if (SUPPORT_SERVER) {
      components.push(new ButtonBuilder().setLabel("Support Server").setURL(SUPPORT_SERVER).setStyle(ButtonStyle.Link));
    }

    if (DASHBOARD.enabled) {
      components.push(new ButtonBuilder().setLabel("Dashboard Link").setURL(DASHBOARD.baseURL).setStyle(ButtonStyle.Link));
    }

    const buttonsRow = new ActionRowBuilder().addComponents(components);

    message.safeReply({ embeds: [embed], components: [buttonsRow] });
  },

  async interactionRun(interaction, data) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: "Invite" })
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setDescription("Thanks, for giving an invite. Just [Click Me](https://au.aarubot.xyz/invite) or click the below button to help me reach your server");

    let components = [
      new ButtonBuilder().setLabel("Invite Link").setURL(interaction.client.getInvite()).setStyle(ButtonStyle.Link),
    ];

    if (SUPPORT_SERVER) {
      components.push(new ButtonBuilder().setLabel("Support Server").setURL(SUPPORT_SERVER).setStyle(ButtonStyle.Link));
    }

    if (DASHBOARD.enabled) {
      components.push(new ButtonBuilder().setLabel("Dashboard Link").setURL(DASHBOARD.baseURL).setStyle(ButtonStyle.Link));
    }

    const buttonsRow = new ActionRowBuilder().addComponents(components);

    interaction.followUp({ embeds: [embed], components: [buttonsRow] });
  },
};
