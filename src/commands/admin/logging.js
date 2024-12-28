const { EmbedBuilder } = require("discord.js");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");
/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "logging",
  description: "enable or disable advanced logs",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "channels",
        description: "enable logging for channel updates",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to send logs (leave empty to disable)",
            type: ApplicationCommandOptionType.Channel,
            required: false,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "roles",
        description: "enable logging for role updates",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to send logs (leave empty to disable)",
            type: ApplicationCommandOptionType.Channel,
            required: false,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "members",
        description: "enable logging for members updates",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to send logs (leave empty to disable)",
            type: ApplicationCommandOptionType.Channel,
            required: false,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "voice",
        description: "enable logging for voice channel updates",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to send logs (leave empty to disable)",
            type: ApplicationCommandOptionType.Channel,
            required: false,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "emojis",
        description: "enable logging for emojis updates",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to send logs (leave empty to disable)",
            type: ApplicationCommandOptionType.Channel,
            required: false,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "invites",
        description: "enable logging for invites updates",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to send logs (leave empty to disable)",
            type: ApplicationCommandOptionType.Channel,
            required: false,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "messages",
        description: "enable logging for messages updates",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to send logs (leave empty to disable)",
            type: ApplicationCommandOptionType.Channel,
            required: false,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "bans",
        description: "enable logging for bans updates",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to send logs (leave empty to disable)",
            type: ApplicationCommandOptionType.Channel,
            required: false,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "threads",
        description: "enable logging for thread updates",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel to send logs (leave empty to disable)",
            type: ApplicationCommandOptionType.Channel,
            required: false,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "status",
        description: "check logging setup status",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let channel = interaction.options.getChannel("channel");
    if (!channel) channel = null;
    let response;
    if (sub === "status") {
      response = getLogStatus(data.settings, interaction.client);
    } else {
      response = await setChannel(channel, data.settings, sub);
    }
    return interaction.followUp(response);
  },
};

async function setChannel(targetChannel, settings, sub) {
  if (!targetChannel && !settings.logging[sub]) {
    return "It is already disabled";
  }

  if (targetChannel && !targetChannel.canSendEmbeds()) {
    return "Ugh! I cannot send logs to that channel? I need the `Write Messages` and `Embed Links` permissions in that channel";
  }

  settings.logging[sub] = targetChannel?.id;
  await settings.save();
  return `Configuration saved! **${parseSub(sub)} Updates** channel ${targetChannel ? `updated to ${targetChannel}` : "removed"}`;
}

/**
 * @param {string} sub
 */
const parseSub = (sub) => {
  return sub.charAt(0).toUpperCase() + sub.slice(1);
};

function getLogStatus(settings, client) {
  const formatted = Object.entries(settings.logging)
    .map(([k, v]) => {
      if (!v) return `${parseSub(k)}: none`;
      const channel = client.channels.cache.get(v);
      return `${parseSub(k)}: ${channel ? channel.toString() : "none"}`;
    })
    .join("\n");
  return {
    embeds: [new EmbedBuilder().setTitle(`Logging Status`).setColor(`Green`).setDescription(formatted)],
  };
}
