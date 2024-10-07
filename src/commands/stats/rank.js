const { AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS, IMAGE } = require("@root/config");
const { getMemberStats, getXpLb } = require("@schemas/MemberStats");
const { RankCard } = require("rankcard");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "rank",
  description: "displays member's rank in this server",
  cooldown: 5,
  category: "STATS",
  botPermissions: ["AttachFiles"],
  command: {
    enabled: true,
    usage: "[@member|id]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "target user",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const member = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await this.getRank(message, member, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(user);
    const response = await this.getRank(interaction, member, data.settings);
    await interaction.followUp(response);
  },

  async getRank({ guild }, member, settings) {
    const { user } = member;
    if (!settings.stats.enabled) return "Stats Tracking is disabled on this server";

    const memberStats = await getMemberStats(guild.id, user.id);
    if (!memberStats.xp) return `${user.username} is not ranked yet!`;

    const lb = await getXpLb(guild.id, 100);
    let pos = -1;
    lb.forEach((doc, i) => {
      if (doc.member_id == user.id) {
        pos = i + 1;
      }
    });

    const xpNeeded = memberStats.level * memberStats.level * 100;

    const card = await RankCard({
      name: user.username,
      level: `Level ${memberStats.level}`,
      color: "auto",
      brightness: "50", // 0 to 100
      avatar: user.displayAvatarURL({ format: "png", size: 2048 }),
      progress: ((memberStats.xp / xpNeeded) * 100).toFixed(2),
      rank: pos !== -1 ? pos.toString() : "NA",
      requiredXp: xpNeeded.toString(),
      currentXp: memberStats.xp.toString(),
      showXp: true,
      shape: "circle", // circle
    });

    const attachment = new AttachmentBuilder(card, { name: "rank.png" });
    return { files: [attachment] };
  },
};
