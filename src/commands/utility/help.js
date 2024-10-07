const { CommandCategory, BotClient } = require("@src/structures");
const { EMBED_COLORS, SUPPORT_SERVER } = require("@root/config.js");
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Message,
  ButtonBuilder,
  CommandInteraction,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require("discord.js");
const { getCommandUsage, getSlashUsage } = require("@handlers/command");

const CMDS_PER_PAGE = 5;
const IDLE_TIMEOUT = 40;

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "help",
  description: "command help menu",
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[command]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "command",
        description: "name of the command",
        required: false,
        type: ApplicationCommandOptionType.String,
      },
    ],
  },

  async messageRun(message, args, data) {
    let trigger = args[0];

    if (!trigger) {
      const response = await getHelpMenu(message);
      const sentMsg = await message.safeReply(response);
      return waiter(sentMsg, message.author.id, data.prefix);
    }

    const cmd = message.client.getCommand(trigger);
    if (cmd) {
      const embed = getCommandUsage(cmd, data.prefix, trigger);
      return message.safeReply({ embeds: [embed] });
    }

    await message.safeReply("No matching command found");
  },

  async interactionRun(interaction) {
    let cmdName = interaction.options.getString("command");

    if (!cmdName) {
      const response = await getHelpMenu(interaction);
      const sentMsg = await interaction.followUp(response);
      return waiter(sentMsg, interaction.user.id);
    }

    const cmd = interaction.client.slashCommands.get(cmdName);
    if (cmd) {
      const embed = getSlashUsage(cmd);
      return interaction.followUp({ embeds: [embed] });
    }

    await interaction.followUp("No matching command found");
  },
};

async function getHelpMenu({ client, guild }) {
  const options = [];
  for (const [k, v] of Object.entries(CommandCategory)) {
    if (v.enabled === false || k === "OWNER") continue;
    options.push({
      label: v.name,
      value: k,
      description: `View commands in ${v.name} category`,
      emoji: v.emoji,
    });
  }

  const menuRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("help-menu")
      .setPlaceholder("Choose the command category")
      .addOptions(options)
  );

  let components = [];
  components.push(
    new ButtonBuilder()
      .setCustomId("previousBtn")
      .setEmoji("<:a_back:1215968893445869569>")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId("nextBtn")
      .setEmoji("<:a_next:1215968877700452394>")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
  );

  let buttonsRow = new ActionRowBuilder().addComponents(components);

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL({ format: "png", size: 2048 }))
    .setDescription(`[Kimo](https://au.aarubot.xyz/invite) - Your new anime bestie! 💕
Hey! I'm a multipurpose bot that works on prefix and slash commands both. you can se my categories below.\n\n**Command Categories**\n> <:a_admin:1215966509181173832> Admin\n> <:a_automod:1215966646976647168> Automod\n> <:a_fun:1215966551371550770> Fun\n> <:a_gift:1215968944855322666> Giveaway\n> <:a_invite:1215968910151651428> Invite\n> <:a_info:1215966490898075779> Information\n> <:a_moderation:1215968928254132244> Moderation\n > <:a_music:1215966626051002368> Music\n > <:a_stats:1215966532589322323> Statistics\n > <:a_utility:1215966585001607238> Utility\n\n[Commands](https://au.aarubot.xyz/commands/) | [Support Server](https://au.aarubot.xyz/support/) | [Invite](https://au.aarubot.xyz/invite/)`);

  return {
    embeds: [embed],
    components: [menuRow, buttonsRow],
  };
}

const waiter = (msg, userId, prefix) => {
  const collector = msg.channel.createMessageComponentCollector({
    filter: (reactor) => reactor.user.id === userId && msg.id === reactor.message.id,
    idle: IDLE_TIMEOUT * 1000,
    dispose: true,
    time: 5 * 60 * 1000,
  });

  let arrEmbeds = [];
  let currentPage = 0;
  let menuRow = msg.components[0];
  let buttonsRow = msg.components[1];

  collector.on("collect", async (response) => {
    if (!["help-menu", "previousBtn", "nextBtn"].includes(response.customId)) return;
    await response.deferUpdate();

    switch (response.customId) {
      case "help-menu": {
        const cat = response.values[0].toUpperCase();
        arrEmbeds = prefix ? getMsgCategoryEmbeds(msg.client, cat, prefix) : getSlashCategoryEmbeds(msg.client, cat);
        currentPage = 0;

        let components = [];
        buttonsRow.components.forEach((button) =>
          components.push(ButtonBuilder.from(button).setDisabled(arrEmbeds.length > 1 ? false : true))
        );

        buttonsRow = new ActionRowBuilder().addComponents(components);
        msg.editable && (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menuRow, buttonsRow] }));
        break;
      }

      case "previousBtn":
        if (currentPage !== 0) {
          --currentPage;
          msg.editable && (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menuRow, buttonsRow] }));
        }
        break;

      case "nextBtn":
        if (currentPage < arrEmbeds.length - 1) {
          currentPage++;
          msg.editable && (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menuRow, buttonsRow] }));
        }
        break;
    }
  });

  collector.on("end", (collected, reason) => {
    if (reason && reason === "user") {
      return;
    }

    if (!msg.guild || !msg.channel) return;

    const timedOutEmbed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("Help menu got Timeout")
      .setDescription(
        "This menu has wilted away like cherry blossoms in the wind. 🍃\n\nDon't worry, you can always summon me again by running </help:1215976212438974514>"
      )
      .setFooter({ text: `Aaruu - Your anime bestie!` })
      .setFields([]);

    const timeoutRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Invite Me").setStyle(ButtonStyle.Link).setURL("https://au.aarubot.xyz/invite"),
      new ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(ButtonStyle.Link)
        .setURL("https://au.aarubot.xyz/support") /*,
  new ButtonBuilder()
    .setLabel('Vote')
    .setStyle(ButtonStyle.Link)
    .setURL('https://au.aarubot.xyz/vote'),
  new ButtonBuilder()
    .setLabel('Commands')
    .setStyle(ButtonStyle.Link)
    .setURL('https://au.aarubot.xyz/commands/')*/
    );

    msg.edit({ content: "", embeds: [timedOutEmbed], components: [timeoutRow] });
  });
};

function getSlashCategoryEmbeds(client, category) {
  const commands = Array.from(client.slashCommands.filter((cmd) => cmd.category === category).values());

  if (commands.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      //.setThumbnail(CommandCategory[category]?.image)
      .setAuthor({ name: `${category} Commands` })
      .setDescription("No commands in this category");

    return [embed];
  }

  const arrSplitted = [];
  const arrEmbeds = [];

  while (commands.length) {
    let toAdd = commands.splice(0, commands.length > CMDS_PER_PAGE ? CMDS_PER_PAGE : commands.length);

    toAdd = toAdd.map((cmd) => {
      const subCmds = cmd.slashCommand.options?.filter((opt) => opt.type === ApplicationCommandOptionType.Subcommand);
      const subCmdsString = subCmds?.map((s) => s.name).join(", ");

      return `\`/${cmd.name}\`\n ❯ **Description**: ${cmd.description}\n ${
        !subCmds?.length ? "" : `❯ **SubCommands [${subCmds?.length}]**: ${subCmdsString}\n`
      } `;
    });

    arrSplitted.push(toAdd);
  }

  arrSplitted.forEach((item, index) => {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      //.setThumbnail(CommandCategory[category]?.image)
      .setAuthor({ name: `${category} Commands` })
      .setDescription(item.join("\n"))
      .setFooter({ text: `page ${index + 1} of ${arrSplitted.length}` });
    arrEmbeds.push(embed);
  });

  return arrEmbeds;
}

function getMsgCategoryEmbeds(client, category, prefix) {
  const commands = client.commands.filter((cmd) => cmd.category === category);

  if (commands.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      //.setThumbnail(CommandCategory[category]?.image)
      .setAuthor({ name: `${category} Commands` })
      .setDescription("No commands in this category");

    return [embed];
  }

  const arrSplitted = [];
  const arrEmbeds = [];

  while (commands.length) {
    let toAdd = commands.splice(0, commands.length > CMDS_PER_PAGE ? CMDS_PER_PAGE : commands.length);
    toAdd = toAdd.map((cmd) => `\`${prefix}${cmd.name}\`\n ❯ ${cmd.description}\n`);
    arrSplitted.push(toAdd);
  }

  arrSplitted.forEach((item, index) => {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      //.setThumbnail(CommandCategory[category]?.image)
      .setAuthor({ name: `${category} Commands` })
      .setDescription(item.join("\n"))
      .setFooter({
        text: `page ${index + 1} of ${arrSplitted.length} | Type ${prefix}help <command> for more command information`,
      });
    arrEmbeds.push(embed);
  });

  return arrEmbeds;
}
