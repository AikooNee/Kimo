const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { OWNER_IDS, PREFIX_COMMANDS, EMBED_COLORS } = require("@root/config");
const { parsePermissions, timeformat } = require("@helpers/Utils");
const { getSettings } = require("@schemas/Guild");

const cooldownCache = new Map();

module.exports = {
  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  handleSlashCommand: async function (interaction) {
    const cmd = interaction.client.slashCommands.get(interaction.commandName);
    if (!cmd) return interaction.reply({ content: "An error has occurred", ephemeral: true }).catch(() => {});

    // callback validations
    if (cmd.validations) {
      for (const validation of cmd.validations) {
        if (!validation.callback(interaction)) {
          const embed = new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription(validation.message);
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
    }

    // Owner commands
    if (cmd.category === "OWNER" && !OWNER_IDS.includes(interaction.user.id)) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setDescription("This command is only accessible to bot owners");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // user permissions
    if (interaction.member && cmd.userPermissions?.length > 0) {
      if (!interaction.member.permissions.has(cmd.userPermissions)) {
        const embed = new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription(`You need ${parsePermissions(cmd.userPermissions)} for this command`);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    // bot permissions
    if (cmd.botPermissions && cmd.botPermissions.length > 0) {
      if (!interaction.guild.members.me.permissions.has(cmd.botPermissions)) {
        const embed = new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription(`I need ${parsePermissions(cmd.botPermissions)} for this command`);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    // cooldown check
    if (cmd.cooldown > 0 && !OWNER_IDS.includes(interaction.user.id)) {
      const remaining = getRemainingCooldown(interaction.user.id, cmd);
      if (remaining > 0) {
        const embed = new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription(`You are on cooldown. You can again use the command in \`${timeformat(remaining)}\``);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    try {
      await interaction.deferReply({ ephemeral: cmd.slashCommand.ephemeral });
      const settings = await getSettings(interaction.guild);
      await cmd.interactionRun(interaction, { settings });
    } catch (ex) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setDescription("Oops! An error occurred while running the command");
      await interaction.followUp({ embeds: [embed], ephemeral: true });
      interaction.client.logger.error("interactionRun", ex);
    } finally {
      if (cmd.cooldown > 0 && !OWNER_IDS.includes(interaction.user.id)) applyCooldown(interaction.user.id, cmd);
    }
  },

  /**
   * @param {import('@structures/Command')} cmd - command object
   */
  getSlashUsage(cmd) {
    let desc = "";
    if (cmd.slashCommand.options?.find((o) => o.type === ApplicationCommandOptionType.Subcommand)) {
      const subCmds = cmd.slashCommand.options.filter((opt) => opt.type === ApplicationCommandOptionType.Subcommand);
      subCmds.forEach((sub) => {
        desc += `\`/${cmd.name} ${sub.name}\`\n❯ ${sub.description}\n\n`;
      });
    } else {
      desc += `\`/${cmd.name}\`\n\n**Help:** ${cmd.description}`;
    }

    if (cmd.cooldown) {
      desc += `\n**Cooldown:** ${timeformat(cmd.cooldown)}`;
    }

    return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(desc);
  },
};

/**
 * @param {string} memberId
 * @param {object} cmd
 */
function applyCooldown(memberId, cmd) {
  const key = cmd.name + "|" + memberId;
  cooldownCache.set(key, Date.now());
}

/**
 * @param {string} memberId
 * @param {object} cmd
 */
function getRemainingCooldown(memberId, cmd) {
  const key = cmd.name + "|" + memberId;
  if (cooldownCache.has(key)) {
    const remaining = (Date.now() - cooldownCache.get(key)) * 0.001;
    if (remaining > cmd.cooldown) {
      cooldownCache.delete(key);
      return 0;
    }
    return cmd.cooldown - remaining;
  }
  return 0;
}
