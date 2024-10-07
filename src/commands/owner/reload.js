const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { spawn } = require("child_process");
/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: "reload",
  description: "Reloads the bot",
  category: "OWNER",
  botPermissions: [],
  command: {
    enabled: true,
    aliases: ["re"],
    usage: "[reload]",
    minArgsCount: 1,
  },
  async messageRun(message, args) {
    const option = args[0];
    const reloading = new EmbedBuilder()
      .setColor(EMBED_COLORS.WARNING)
      .setAuthor({ name: message.client.user.username, iconURL: message.client.user.avatarURL({ dynamic: true }) })
      .setDescription(`Reloading ${message.client.user.username}${option != "bot" ? " " + option : ""}...`)
      .setTimestamp(Date.now());
    const success = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setAuthor({ name: message.client.user.username, iconURL: message.client.user.avatarURL({ dynamic: true }) })
      .setDescription(
        `${message.client.user.username} ${option != "bot" ? option : ""} has been reloaded successfully!`
      )
      .setTimestamp(Date.now());
    switch (option) {
      case "bot": {
        try {
          const reply = await message.reply({ embeds: [reloading] });
          spawn(process.argv[0], process.argv.slice(1), {
            detached: true,
            stdio: "ignore",
          }).unref();
          reply.edit({ embeds: [success] });
          process.exit(0);
        } catch (error) {
          const failed = new EmbedBuilder()
            .setColor(EMBED_COLORS.ERROR)
            .setAuthor({
              name: message.client.user.username,
              iconURL: message.client.user.avatarURL({ dynamic: true }),
            })
            .setDescription("Failed to reload Bot")
            .addFields({ name: "Error Detail:", value: "```js\n" + error + "```" })
            .setTimestamp(Date.now());
          message.safeReply({ embeds: [failed] });
        }
        break;
      }
      case "cmds":
      case "commands": {
        const reply = await message.reply({ embeds: [reloading] });
        message.client.commands = [];
        message.client.commandIndex.clear();
        message.client.slashCommands.clear();
        message.client.contextMenus.clear();
        message.client.loadContexts("src/contexts");
        message.client.loadCommands("src/commands");
        reply.edit({ embeds: [success] });
        return;
      }
      default:
        await message.safeReply(
          "Invalid option, availabe options:\n- `bot`: reloads the whole bot.\n- `commands`: reloads commands only (including contexts)"
        );
        break;
    }
  },
};
