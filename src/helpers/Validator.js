const CommandCategory = require("@structures/CommandCategory");
const permissions = require("./permissions");
const config = require("@root/config");
const { log, warn, error } = require("./Logger");
const { ApplicationCommandType } = require("discord.js");

module.exports = class Validator {
  static validateConfiguration() {
    log("Validating config file and environment variables");

    // Bot Token
    if (!process.env.BOT_TOKEN) {
      error("env: BOT_TOKEN cannot be empty");
      process.exit(1);
    }

    // Validate Database Config
    if (!process.env.MONGO_CONNECTION) {
      error("env: MONGO_CONNECTION cannot be empty");
      process.exit(1);
    }

    // Cache Size
    if (isNaN(config.CACHE_SIZE.GUILDS) || isNaN(config.CACHE_SIZE.USERS) || isNaN(config.CACHE_SIZE.MEMBERS)) {
      error("config.js: CACHE_SIZE must be a positive integer");
      process.exit(1);
    }

    // Music
    if (config.MUSIC.ENABLED) {
      if (config.MUSIC.LAVALINK_NODES.length == 0) {
        warn("config.js: There must be at least one node for Lavalink");
      }
    }

    // Warnings
    if (config.OWNER_IDS.length === 0) warn("config.js: OWNER_IDS are empty");
  }

  /**
   * @param {import('@structures/Command')} cmd
   */
  static validateCommand(cmd) {
    if (typeof cmd !== "object") {
      throw new TypeError("Command data must be an Object.");
    }
    if (typeof cmd.name !== "string" || cmd.name !== cmd.name.toLowerCase()) {
      throw new Error("Command name must be a lowercase string.");
    }
    if (typeof cmd.description !== "string") {
      throw new TypeError("Command description must be a string.");
    }
    if (cmd.cooldown && typeof cmd.cooldown !== "number") {
      throw new TypeError("Command cooldown must be a number");
    }
    if (cmd.category) {
      if (!Object.prototype.hasOwnProperty.call(CommandCategory, cmd.category)) {
        throw new Error(`Not a valid category ${cmd.category}`);
      }
    }
    if (cmd.userPermissions) {
      if (!Array.isArray(cmd.userPermissions)) {
        throw new TypeError("Command userPermissions must be an Array of permission key strings.");
      }
      for (const perm of cmd.userPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
      }
    }
    if (cmd.botPermissions) {
      if (!Array.isArray(cmd.botPermissions)) {
        throw new TypeError("Command botPermissions must be an Array of permission key strings.");
      }
      for (const perm of cmd.botPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command botPermission: ${perm}`);
      }
    }
    if (cmd.validations) {
      if (!Array.isArray(cmd.validations)) {
        throw new TypeError("Command validations must be an Array of validation Objects.");
      }
      for (const validation of cmd.validations) {
        if (typeof validation !== "object") {
          throw new TypeError("Command validations must be an object.");
        }
        if (typeof validation.callback !== "function") {
          throw new TypeError("Command validation callback must be a function.");
        }
        if (typeof validation.message !== "string") {
          throw new TypeError("Command validation message must be a string.");
        }
      }
    }

    // Validate Slash Command Details
    if (cmd.slashCommand) {
      if (typeof cmd.slashCommand !== "object") {
        throw new TypeError("Command.slashCommand must be an object");
      }
      if (
        Object.prototype.hasOwnProperty.call(cmd.slashCommand, "enabled") &&
        typeof cmd.slashCommand.enabled !== "boolean"
      ) {
        throw new TypeError("Command.slashCommand enabled must be a boolean value");
      }
      if (
        Object.prototype.hasOwnProperty.call(cmd.slashCommand, "ephemeral") &&
        typeof cmd.slashCommand.ephemeral !== "boolean"
      ) {
        throw new TypeError("Command.slashCommand ephemeral must be a boolean value");
      }
      if (cmd.slashCommand.options && !Array.isArray(cmd.slashCommand.options)) {
        throw new TypeError("Command.slashCommand options must be a array");
      }
      if (cmd.slashCommand.enabled && typeof cmd.interactionRun !== "function") {
        throw new TypeError("Missing 'interactionRun' function");
      }
    }
  }

  /**
   * @param {import('@structures/BaseContext')} context
   */
  static validateContext(context) {
    if (typeof context !== "object") {
      throw new TypeError("Context must be an object");
    }
    if (typeof context.name !== "string" || context.name !== context.name.toLowerCase()) {
      throw new Error("Context name must be a lowercase string.");
    }
    if (typeof context.description !== "string") {
      throw new TypeError("Context description must be a string.");
    }
    if (context.type !== ApplicationCommandType.User && context.type !== ApplicationCommandType.Message) {
      throw new TypeError("Context type must be a either User/Message.");
    }
    if (Object.prototype.hasOwnProperty.call(context, "enabled") && typeof context.enabled !== "boolean") {
      throw new TypeError("Context enabled must be a boolean value");
    }
    if (Object.prototype.hasOwnProperty.call(context, "ephemeral") && typeof context.ephemeral !== "boolean") {
      throw new TypeError("Context enabled must be a boolean value");
    }
    if (
      Object.prototype.hasOwnProperty.call(context, "defaultPermission") &&
      typeof context.defaultPermission !== "boolean"
    ) {
      throw new TypeError("Context defaultPermission must be a boolean value");
    }
    if (Object.prototype.hasOwnProperty.call(context, "cooldown") && typeof context.cooldown !== "number") {
      throw new TypeError("Context cooldown must be a number");
    }
    if (context.userPermissions) {
      if (!Array.isArray(context.userPermissions)) {
        throw new TypeError("Context userPermissions must be an Array of permission key strings.");
      }
      for (const perm of context.userPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
      }
    }
  }
};
