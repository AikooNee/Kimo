const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "autorole",
  description: "setup roles to be given when a member joins the server",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "add",
        description: "add roles to the autorole list (up to 4)",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role1",
            description: "the first role to be added",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
          {
            name: "role2",
            description: "the second role to be added",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
          {
            name: "role3",
            description: "the third role to be added",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
          {
            name: "role4",
            description: "the fourth role to be added",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
        ],
      },
      {
        name: "remove",
        description: "remove roles from the autorole list",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role1",
            description: "the first role to be removed",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
          {
            name: "role2",
            description: "the second role to be removed",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
          {
            name: "role3",
            description: "the third role to be removed",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
          {
            name: "role4",
            description: "the fourth role to be removed",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
        ],
      },
      {
        name: "list",
        description: "list all roles in the autorole list",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    if (sub === "add") {
      const roles = [
        interaction.options.getRole("role1"),
        interaction.options.getRole("role2"),
        interaction.options.getRole("role3"),
        interaction.options.getRole("role4"),
      ].filter(Boolean);

      response = await addAutoRoles(interaction, roles, data.settings);
    } else if (sub === "remove") {
      const roles = [
        interaction.options.getRole("role1"),
        interaction.options.getRole("role2"),
        interaction.options.getRole("role3"),
        interaction.options.getRole("role4"),
      ].filter(Boolean);

      response = await removeAutoRoles(interaction, roles, data.settings);
    } else if (sub === "list") {
      response = listAutoRoles(data.settings);
    } else {
      response = "Invalid subcommand";
    }

    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").Message | import("discord.js").CommandInteraction} context
 * @param {Array<import("discord.js").Role>} roles
 * @param {import("@models/Guild")} settings
 */
async function addAutoRoles({ guild }, roles, settings) {
  if (!settings.autoroles) settings.autoroles = [];

  for (const role of roles) {
    if (role.id === guild.roles.everyone.id) return `You cannot set \`@everyone\` as an autorole`;
    if (!guild.members.me.permissions.has("ManageRoles")) return `I don't have the \`ManageRoles\` permission`;
    if (guild.members.me.roles.highest.position < role.position)
      return `I don't have the permissions to assign the role ${role.name}`;
    if (role.managed) return `Oops! The role ${role.name} is managed by an integration`;

    if (!settings.autoroles.includes(role.id)) settings.autoroles.push(role.id);
  }

  if (settings.autoroles.length > 4) return `You can only have up to 4 autoroles`;

  await settings.save();
  return `Roles have been added to the autorole list: ${roles.map((role) => role.name).join(", ")}`;
}

/**
 * @param {import("discord.js").Message | import("discord.js").CommandInteraction} context
 * @param {Array<import("discord.js").Role>} roles
 * @param {import("@models/Guild")} settings
 */
async function removeAutoRoles({ guild }, roles, settings) {
  if (!settings.autoroles) settings.autoroles = [];

  for (const role of roles) {
    if (!settings.autoroles.includes(role.id)) return `The role ${role.name} is not in the autorole list`;

    settings.autoroles = settings.autoroles.filter((r) => r !== role.id);
  }

  await settings.save();
  return `Roles have been removed from the autorole list: ${roles.map((role) => role.name).join(", ")}`;
}

/**
 * @param {import("@models/Guild")} settings
 */
function listAutoRoles(settings) {
  if (!settings.autoroles || settings.autoroles.length === 0) return "No autoroles are set up";

  return `Current autoroles: ${settings.autoroles.map((id) => `<@&${id}>`).join(", ")}`;
}