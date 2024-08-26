const { ApplicationCommandOptionType, ChannelType, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

const languages = [
  { name: "English", value: "en" },
  { name: "Korean", value: "ko" },
  { name: "Japanese", value: "ja" },
  { name: "Spanish", value: "es" },
  { name: "French", value: "fr" },
  { name: "German", value: "de" },
  { name: "Italian", value: "it" },
  { name: "Portuguese", value: "pt" },
  { name: "Russian", value: "ru" },
  { name: "Chinese (Simplified)", value: "zh-cn" },
  { name: "Chinese (Traditional)", value: "zh-tw" },
  { name: "Hindi", value: "hi" },
  { name: "Arabic", value: "ar" },
  { name: "Urdu", value: "ur" },
  { name: "Greek", value: "el" },
  { name: "Polish", value: "pl" },
  { name: "Swedish", value: "sv" },
  { name: "Turkish", value: "tr" },
  { name: "Vietnamese", value: "vi" },
  { name: "Finnish", value: "fi" },
  { name: "Danish", value: "da" },
  { name: "Norwegian", value: "no" },
  { name: "Indonesian", value: "id" },
  { name: "Malay", value: "ms" },
  { name: "Bengali", value: "bn" },
];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "aichat",
  description: "Setup Ai chatbot in your server",
  category: "UTILITY",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<set | delete> <language>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "set",
        description: "Set the Ai chatbot",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "Choose channel",
            required: false,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
          {
            name: "language",
            description: "Choose language",
            required: false,
            type: ApplicationCommandOptionType.String,
            choices: languages.map(lang => ({ name: lang.name, value: lang.value })),
          },
        ],
      },
      {
        name: "remove",
        description: "Remove Ai chatbot channel",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "language",
        description: "Update Ai chatbot language",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "select_lang",
            description: "Choose language",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: languages.map(lang => ({ name: lang.name, value: lang.value })),
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("This command is only available as a slash command </chatbot language:1231487088768192596>");

    await message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction, data) {
    const response = await chatbot(data, interaction);
    await interaction.followUp(response);
  }
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} data
 */
async function chatbot(data, interaction) {
  const subcommand = interaction.options.getSubcommand();
  const settings = data.settings;

  if (subcommand === "set") {
    let Chatchannel = interaction.options.getChannel("channel") || interaction.channel;
    let language = interaction.options.getString("language") ?? "en";

    if (!settings.chatbot.channel) {
      settings.chatbot.channel = Chatchannel.id;
      settings.chatbot.language = language;
      await settings.save();

      const langName = getLangName(language);
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.SUCCESS)
        .setDescription(`Chatbot channel set to ${Chatchannel} with language ${langName}.`);
      
      return { embeds: [embed] };
    } else {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setDescription(`Chatbot is already set in this guild. Current channel: <#${settings.chatbot.channel}>`);
      
      return { embeds: [embed] };
    }
  } else if (subcommand === "remove") {
    if (!data.settings.chatbot.channel) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setDescription("No chatbot setup found in this guild.");
      
      return { embeds: [embed] };
    }

    settings.chatbot = null;
    await settings.save();

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setDescription("Chatbot channel deleted successfully.");

    return { embeds: [embed] };
  } else if (subcommand === "language") {
    let language = interaction.options.getString("select_lang") ?? "en";

    if (!settings.chatbot.channel) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setDescription("No chatbot setup found in this guild.");
      
      return { embeds: [embed] };
    }

    if (language === settings.chatbot.language) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setDescription(`Chatbot language is already set to ${getLangName(language)}.`);
      
      return { embeds: [embed] };
    }

    settings.chatbot.language = language;
    await settings.save();

    const langName = getLangName(language);
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setDescription(`Chatbot language updated to ${langName}.`);
    
    return { embeds: [embed] };
  }
}

/**
 * Function to get the language name from the language code
 * @param {string} code - Language code
 * @returns {string} - Language name
 */
function getLangName(code) {
  const language = languages.find(lang => lang.value === code);
  return language ? language.name : "English";
}
