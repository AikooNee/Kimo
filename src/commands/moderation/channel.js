const { ApplicationCommandOptionType, ChannelType, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = {
  name: "channel",
  description: "Lock or unlock channels",
  category: "MODERATION",
  userPermissions: ["ManageChannels"],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "lock",
        description: "Locks a text channel",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "The channel to lock",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "unlock",
        description: "Unlocks a text channel",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "The channel to unlock",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "lock" || sub === "unlock") {
      const targetChannel = interaction.options.getChannel("channel") || interaction.channel;
      const action = sub === "lock" ? lockChannel : unlockChannel;

      if (await getChannel(targetChannel, sub === "lock")) {
        const responseEmbed = new EmbedBuilder()
          .setDescription(`Channel <#${targetChannel.id}> is already ${sub === "lock" ? "locked" : "unlocked"}.`)
          .setColor(EMBED_COLORS.BOT_EMBED);
        await interaction.followUp({ embeds: [responseEmbed] });
      } else {
        await action(targetChannel);
        const responseEmbed = new EmbedBuilder()
          .setDescription(`Channel <#${targetChannel.id}> has been ${sub === "lock" ? "locked" : "unlocked"}.`)
          .setColor(EMBED_COLORS.BOT_EMBED);
        await interaction.followUp({ embeds: [responseEmbed] });
      }
    }
  },
};

async function getChannel(channel, Locked) {
  const permissions = channel.permissionsFor(channel.guild.roles.everyone);
  const getLocked = !permissions?.has("SendMessages");
  return getLocked === Locked;
}

async function lockChannel(channel) {
  await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
    SendMessages: false,
  });
}

async function unlockChannel(channel) {
  await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
    SendMessages: true,
  });
}
