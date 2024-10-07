const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = (member) => {
  let color = member.displayHexColor;
  if (color === "#000000") color = EMBED_COLORS.BOT_EMBED;

  let rolesMentions = member.roles.cache.map((r) => r.toString()).join(", ");
  if (rolesMentions.length > 1024) rolesMentions = rolesMentions.substring(0, 1020) + "...";

  let topRole = member.roles.highest;
  let isBooster = member.premiumSince !== null ? "True" : "False";
  let isBot = member.user.bot ? "Ture" : "False";

  const embed = new EmbedBuilder()
    .setTitle(`Who is ${member.displayName}?`)
    .setThumbnail(member.user.displayAvatarURL({ size: 4096 }))
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(
      `**Display name:** ${member.user.displayName}\n` +
        `**User name:** ${member.user.username}\n` +
        `**Joined (${member.guild.name}):** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>\n` +
        `**Create at:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n` +
        `**Bot:** ${isBot}\n` +
        `**Booster this server:** ${isBooster}\n`
    )
    .addFields({
      name: `Roles [${member.roles.cache.size}]`,
      value: `${rolesMentions}\n**Top roles:** ${topRole.toString()}`,
    })
    .setFooter({ text: `Requested by ${member.user.tag}` })
    .setTimestamp();

  return { embeds: [embed] };
};
