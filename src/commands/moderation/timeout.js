const { timeoutTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const ems = require("enhanced-ms");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "timeout",
  description: "timeouts the specified member",
  category: "MODERATION",
  botPermissions: ["ModerateMembers"],
  userPermissions: ["ModerateMembers"],
  command: {
    enabled: true,
    aliases: ["mute"],
    usage: "<ID|@member> <duration> [reason]",
    minArgsCount: 2,
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
        name: "duration",
        description: "the time to timeout the member for",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "reason",
        description: "reason for timeout",
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

    // parse time
    const ms = ems(args[1]);
    if (!ms) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription("Please provide a valid duration. Example: 1d/1h/1m/1s");
      return message.safeReply({ embeds: [embed] });
    }

    const reason = args.slice(2).join(" ").trim();
    const response = await timeout(message.member, target, ms, reason);
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(response);
    await message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");

    // parse time
    const duration = interaction.options.getString("duration");
    const ms = ems(duration);
    if (!ms) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription("Please provide a valid duration. Example: 1d/1h/1m/1s");
      return interaction.followUp({ embeds: [embed] });
    }

    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await timeout(interaction.member, target, ms, reason);
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(response);
    await interaction.followUp({ embeds: [embed] });
  },
};

async function timeout(issuer, target, ms, reason) {
  if (isNaN(ms)) return "Please provide a valid duration. Example: 1d/1h/1m/1s";
  const response = await timeoutTarget(issuer, target, ms, reason);
  if (typeof response === "boolean") return `${target.user.username} is timed out!`;
  if (response === "BOT_PERM") return `I do not have permission to timeout ${target.user.username}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to timeout ${target.user.username}`;
  else if (response === "ALREADY_TIMEOUT") return `${target.user.username} is already timed out!`;
  else return `Failed to timeout ${target.user.username}`;
}
