const { warnTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "warn",
  description: "warns the specified member",
  category: "MODERATION",
  userPermissions: ["KickMembers"],
  command: {
    enabled: true,
    usage: "<ID|@member> [reason]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "the target member",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "reason",
        description: "reason for warn",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(`No user found matching ${args[0]}`);
      return message.safeReply({ embeds: [embed] });
    }
    const reason = message.content.split(args[0])[1].trim();
    const response = await warn(message.member, target, reason);
    const embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(response);
    await message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await warn(interaction.member, target, reason);
    const embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(response);
    await interaction.followUp({ embeds: [embed] });
  },
};

async function warn(issuer, target, reason) {
  const response = await warnTarget(issuer, target, reason);
  if (typeof response === "boolean") return `${target.user.username} is warned!`;
  if (response === "BOT_PERM") return `I do not have permission to warn ${target.user.username}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to warn ${target.user.username}`;
  else return `Failed to warn ${target.user.username}`;
}
