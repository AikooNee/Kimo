const {
  ChannelType,
  ButtonBuilder,
  ActionRowBuilder,
  ComponentType,
  TextInputStyle,
  TextInputBuilder,
  ModalBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
} = require("discord.js");
const { parsePermissions } = require("@helpers/Utils");
const ems = require("enhanced-ms");

// Sub Commands
const start = require("./sub/start");
const pause = require("./sub/pause");
const resume = require("./sub/resume");
const end = require("./sub/end");
const reroll = require("./sub/reroll");
const list = require("./sub/list");
const edit = require("./sub/edit");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "giveaway",
  description: "giveaway commands",
  category: "GIVEAWAY",
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "start",
        description: "start a giveaway",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "the channel to start the giveaway in",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "pause",
        description: "pause a giveaway",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message_id",
            description: "the message id of the giveaway",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "resume",
        description: "resume a paused giveaway",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message_id",
            description: "the message id of the giveaway",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "end",
        description: "end a giveaway",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message_id",
            description: "the message id of the giveaway",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "reroll",
        description: "reroll a giveaway",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message_id",
            description: "the message id of the giveaway",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "list",
        description: "list all giveaways",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "edit",
        description: "edit a giveaway",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message_id",
            description: "the message id of the giveaway",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "add_duration",
            description: "the number of minutes to add to the giveaway duration",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
          {
            name: "new_prize",
            description: "the new prize",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
          {
            name: "new_winners",
            description: "the new number of winners",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response;

    if (sub === "start") {
      const channel = interaction.options.getChannel("channel");
      await interaction.followUp("Starting Giveaway system...");
      return await runModalSetup(interaction, channel);
    } else if (sub === "pause") {
      const messageId = interaction.options.getString("message_id");
      response = await pause(interaction.member, messageId);
    } else if (sub === "resume") {
      const messageId = interaction.options.getString("message_id");
      response = await resume(interaction.member, messageId);
    } else if (sub === "end") {
      const messageId = interaction.options.getString("message_id");
      response = await end(interaction.member, messageId);
    } else if (sub === "reroll") {
      const messageId = interaction.options.getString("message_id");
      response = await reroll(interaction.member, messageId);
    } else if (sub === "list") {
      response = await list(interaction.member);
    } else if (sub === "edit") {
      const messageId = interaction.options.getString("message_id");
      const addDur = interaction.options.getInteger("add_duration");
      const addDurationMs = addDur ? ems(addDur) : null;
      if (!addDurationMs) {
        return interaction.followUp("Not a valid duration");
      }
      const newPrize = interaction.options.getString("new_prize");
      const newWinnerCount = interaction.options.getInteger("new_winners");
      const description = interaction.options.getString("description");
      response = await edit(interaction.member, messageId, addDurationMs, newPrize, newWinnerCount, description);
    } else response = "Invalid subcommand";

    await interaction.followUp(response);
  },
};

async function runModalSetup({ member, channel, guild }, targetCh) {
  const SETUP_PERMS = ["ViewChannel", "SendMessages", "EmbedLinks"];

  if (!targetCh) return channel.safeSend("Giveaway setup has been cancelled. You did not mention a channel");
  if (!targetCh.type === ChannelType.GuildText && !targetCh.permissionsFor(guild.members.me).has(SETUP_PERMS)) {
    return channel.safeSend(
      `Giveaway setup has been cancelled.\nI need ${parsePermissions(SETUP_PERMS)} in ${targetCh}`
    );
  }

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("giveaway_btnSetup").setLabel("Setup Giveaway").setStyle(ButtonStyle.Primary)
  );

  const sentMsg = await channel.safeSend({
    content: "Please click the button below to setup new giveaway",
    components: [buttonRow],
  });

  if (!sentMsg) return;

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "giveaway_btnSetup" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return sentMsg.edit({ content: "No response received, cancelling setup", components: [] });

  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "giveaway-modalSetup",
      title: "Giveaway Setup",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("prize")
            .setLabel("Prize?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("winners")
            .setLabel("Winner Count")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("duration")
            .setLabel("Duration")
            .setPlaceholder("Example: 1m, 1h, 1d, 1w")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("description")
            .setLabel("Description")
            .setPlaceholder("Give a short discription about giveaway")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(10)
            .setMaxLength(1_000)
            .setRequired(false)
        ),
      ],
    })
  );

  const modal = await btnInteraction
    .awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "giveaway-modalSetup" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => {});

  if (!modal) return sentMsg.edit({ content: "No response received, cancelling setup", components: [] });

  sentMsg.delete().catch(() => {});
  await modal.reply("Setting up giveaway...");

  const prize = modal.fields.getTextInputValue("prize");
  const winners = parseInt(modal.fields.getTextInputValue("winners"));
  const duration = ems(modal.fields.getTextInputValue("duration"));
  const description = modal.fields.getTextInputValue("description");

  if (isNaN(winners)) return modal.editReply("Setup has been cancelled. You did not specify a valid winner count");

  const response = await start(member, targetCh, duration, prize, winners, description);
  await modal.editReply(response);
}

async function runModalEdit(message, messageId) {
  const { member, channel } = message;

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("giveaway_btnEdit").setLabel("Edit Giveaway").setStyle(ButtonStyle.Primary)
  );

  const sentMsg = await channel.send({
    content: "Please click the button below to edit the giveaway",
    components: [buttonRow],
  });

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "giveaway_btnEdit" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return sentMsg.edit({ content: "No response received, cancelling update", components: [] });

  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "giveaway-modalEdit",
      title: "Giveaway Update",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("prize")
            .setLabel("New Prize")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("winners")
            .setLabel("New Winner Count")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("duration")
            .setLabel("Duration to Add")
            .setPlaceholder("Example: 1m, 1h, 1d, 1w")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
      ],
    })
  );

  const modal = await btnInteraction
    .awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "giveaway-modalEdit" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => {});

  if (!modal) return sentMsg.edit({ content: "No response received, cancelling update", components: [] });

  sentMsg.delete().catch(() => {});
  await modal.reply("Updating the giveaway...");

  const newPrize = modal.fields.getTextInputValue("prize");
  const newWinnerCount = parseInt(modal.fields.getTextInputValue("winners"));
  const addDuration = ems(modal.fields.getTextInputValue("duration"));

  if (isNaN(newWinnerCount)) {
    return modal.editReply("Update has been cancelled. You did not specify a valid winner count");
  }

  const response = await edit(message.member, messageId, addDuration, newPrize, newWinnerCount);
  await modal.editReply(response);
}
