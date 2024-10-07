const { banTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ban",
  description: "bans the specified member",
  category: "MODERATION",
  botPermissions: ["BanMembers"],
  userPermissions: ["BanMembers"],
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
        description: "reason for ban",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const match = await message.client.resolveUsers(args[0], true);
    const target = match[0];
    if (!target) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(`No user found matching ${args[0]}`);
      return message.safeReply({ embeds: [embed] });
    }
    const reason = message.content.split(args[0])[1].trim();
    const response = await ban(message.member, target, reason);
    const embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(response);
    await message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    const response = await ban(interaction.member, target, reason);
    const embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(response);
    await interaction.followUp({ embeds: [embed] });
  },
};

async function ban(issuer, target, reason) {
  const response = await banTarget(issuer, target, reason);
  if (typeof response === "boolean") return `${target.username} is banned!`;
  if (response === "BOT_PERM") return `I do not have permission to ban ${target.username}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to ban ${target.username}`;
  else return `Failed to ban ${target.username}`;
}
