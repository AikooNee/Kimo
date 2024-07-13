const { EmbedBuilder, escapeInlineCode, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { getInvitesLb } = require("@schemas/Member");
const { getXpLb } = require("@schemas/MemberStats");

module.exports = {
  name: "leaderboard",
  description: "Display the XP and invite leaderboard",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["lb"],
    minArgsCount: 1,
    usage: "<xp|invite>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "type",
        description: "Type of leaderboard to display",
        required: true,
        type: ApplicationCommandOptionType.String,
        choices: [
          { name: "xp", value: "xp" },
          { name: "invite", value: "invite" }
        ],
      },
    ],
  },
  async messageRun(message, args, data) {
    const type = args[0].toLowerCase();
    const response = await getLeaderboard(message, type, data.settings, message.author.displayName);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const type = interaction.options.getString("type");
    const response = await getLeaderboard(interaction, type, data.settings, interaction.user.displayName);
    await interaction.followUp(response);
  },
};

async function getLeaderboard(source, type, settings, UwU) {
  const uwuMessageMap = {
    xp: "The leaderboard is disabled on this server",
    invite: "Invite tracking is disabled on this server",
  };

  const uwuMessage = uwuMessageMap[type] || "Invalid Leaderboard type. Choose either `xp` or `invite`";

  if ((type === "xp" && !settings.stats.enabled) || (type === "invite" && !settings.invite.tracking)) {
    return uwuEmbed(uwuMessage);
  }

  const lbData = await fetchLeaderboardData(type, source.guild.id, 100);

  if (lbData.length === 0) {
    return uwuEmbed(uwuMessage);
  }

  const collector = await Promise.all(lbData.map(async (data, index) => {
    try {
      const user = await source.client.users.fetch(data.member_id);
      const uwuName = `<@${user.id}>`;
      return `**#${index + 1}** - ${escapeInlineCode(uwuName)} ${type === "xp" ? "XP" : "Invites"}: ${type === "xp" ? data.xp : data.invites}\n`;
    } catch {
      return null;
    }
  }));

  const embed = new EmbedBuilder()
    .setTitle(`${type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector.filter(Boolean).join(''))
    .setFooter({ text: `Requested by ${UwU}` });

  return { embeds: [embed] };
}

async function fetchLeaderboardData(type, guildId, limit) {
  switch (type) {
    case "xp":
      return getXpLb(guildId, limit);
    case "invite":
      return getInvitesLb(guildId, limit);
    default:
      return [];
  }
}

function uwuEmbed(description) {
  return {
    embeds: [
      new EmbedBuilder()
        .setDescription(description)
        .setColor(EMBED_COLORS.ERROR)
    ]
  };
}
