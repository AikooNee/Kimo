const { unBanTarget } = require("@helpers/ModUtils");
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ApplicationCommandOptionType,
  ComponentType,
  EmbedBuilder,
} = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "unban",
  description: "unbans the specified member",
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
    ephemeral: true,
    options: [
      {
        name: "name",
        description: "match the name of the member",
        type: ApplicationCommandOptionType.String,
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
    const match = args[0];
    const reason = message.content.split(args[0])[1].trim();

    const response = await getMatchingBans(message.guild, match);
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(response);
    const sent = await message.safeReply({ embeds: [embed] });
    if (typeof response !== "string") await waitForBan(message.member, reason, sent);
  },

  async interactionRun(interaction) {
    const match = interaction.options.getString("name");
    const reason = interaction.options.getString("reason");

    const response = await getMatchingBans(interaction.guild, match);
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(response);
    const sent = await interaction.followUp({ embeds: [embed] });
    if (typeof response !== "string") await waitForBan(interaction.member, reason, sent);
  },
};

/**
 * @param {import('discord.js').Guild} guild
 * @param {string} match
 */
async function getMatchingBans(guild, match) {
  const bans = await guild.bans.fetch({ cache: false });

  const matched = [];
  for (const [, ban] of bans) {
    if (ban.user.partial) await ban.user.fetch();

    // exact match
    if (ban.user.id === match || ban.user.tag === match) {
      matched.push(ban.user);
      break;
    }

    // partial match
    if (ban.user.username.toLowerCase().includes(match.toLowerCase())) {
      matched.push(ban.user);
    }
  }

  if (matched.length === 0) return `No user found matching ${match}`;

  const options = [];
  for (const user of matched) {
    options.push({ label: user.tag, value: user.id });
  }

  const menuRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId("unban-menu").setPlaceholder("Choose a user to unban").addOptions(options)
  );

  return { content: "Please select a user you wish to unban", components: [menuRow] };
}

/**
 * @param {import('discord.js').GuildMember} issuer
 * @param {string} reason
 * @param {import('discord.js').Message} sent
 */
async function waitForBan(issuer, reason, sent) {
  const collector = sent.channel.createMessageComponentCollector({
    filter: (m) => m.member.id === issuer.id && m.customId === "unban-menu" && sent.id === m.message.id,
    time: 20000,
    max: 1,
    componentType: ComponentType.StringSelect,
  });

  //
  collector.on("collect", async (response) => {
    const userId = response.values[0];
    const user = await issuer.client.users.fetch(userId, { cache: true });

    const status = await unBanTarget(issuer, user, reason);
    if (typeof status === "boolean") return sent.edit({ content: `${user.username} is un-banned!`, components: [] });
    else return sent.edit({ content: `Failed to unban ${user.username}`, components: [] });
  });

  // collect user and unban
  collector.on("end", async (collected) => {
    if (collected.size === 0) return sent.edit("Oops! Timed out. Try again later.");
  });
}
