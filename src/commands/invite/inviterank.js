const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "inviterank",
  description: "configure invite ranks",
  category: "INVITE",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<role-name> <invites>",
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "add <role> <invites>",
        description: "add auto-rank after reaching a particular number of invites",
      },
      {
        trigger: "remove role",
        description: "remove invite rank configured with that role",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "add",
        description: "add a new invite rank",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "role to be given",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
          {
            name: "invites",
            description: "number of invites required to obtain the role",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "remove",
        description: "remove a previously configured invite rank",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "role with configured invite rank",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0].toLowerCase();

    if (sub === "add") {
      const query = args[1];
      const invites = args[2];

      if (isNaN(invites)) return message.safeReply(`\`${invites}\` is not a valid number of invites?`);
      const role = message.guild.findMatchingRoles(query)[0];
      if (!role) return message.safeReply(`No roles found matching \`${query}\``);

      const response = await addInviteRank(message, role, invites, data.settings);
      await message.safeReply(response);
    }

    //
    else if (sub === "remove") {
      const query = args[1];
      const role = message.guild.findMatchingRoles(query)[0];
      if (!role) return message.safeReply(`No roles found matching \`${query}\``);
      const response = await removeInviteRank(message, role, data.settings);
      await message.safeReply(response);
    }

    //
    else {
      await message.safeReply("Incorrect command usage!");
    }
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    //
    if (sub === "add") {
      const role = interaction.options.getRole("role");
      const invites = interaction.options.getInteger("invites");

      const response = await addInviteRank(interaction, role, invites, data.settings);
      await interaction.followUp(response);
    }

    //
    else if (sub === "remove") {
      const role = interaction.options.getRole("role");
      const response = await removeInviteRank(interaction, role, data.settings);
      await interaction.followUp(response);
    }
  },
};

async function addInviteRank({ guild }, role, invites, settings) {
  if (!settings.invite.tracking) return `Invite tracking is disabled in this server`;

  if (role.managed) {
    return "You cannot assign a bot role";
  }

  if (guild.roles.everyone.id === role.id) {
    return "I cannot assign the everyone role.";
  }

  if (!role.editable) {
    return "I am missing permissions to move members to that role. Is that role below my highest role?";
  }

  const exists = settings.invite.ranks.find((obj) => obj._id === role.id);

  let msg = "";
  if (exists) {
    exists.invites = invites;
    msg += "Previous configuration found for this role. Overwriting data\n";
  }

  settings.invite.ranks.push({ _id: role.id, invites });
  await settings.save();
  return `${msg}Success! Configuration saved.`;
}

async function removeInviteRank({ guild }, role, settings) {
  if (!settings.invite.tracking) return `Invite tracking is disabled in this server`;

  if (role.managed) {
    return "You cannot assign a bot role";
  }

  if (guild.roles.everyone.id === role.id) {
    return "You cannot assign the everyone role.";
  }

  if (!role.editable) {
    return "I am missing permissions to move members from that role. Is that role below my highest role?";
  }

  const exists = settings.invite.ranks.find((obj) => obj._id === role.id);
  if (!exists) return "No previous invite rank is configured found for this role";

  // delete element from array
  const i = settings.invite.ranks.findIndex((obj) => obj._id === role.id);
  if (i > -1) settings.invite.ranks.splice(i, 1);

  await settings.save();
  return "Success! Configuration saved.";
}
