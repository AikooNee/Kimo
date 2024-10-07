const { counterHandler, inviteHandler } = require("@src/handlers");
const { cacheReactionRoles } = require("@schemas/ReactionRoles");
const { getSettings } = require("@schemas/Guild");
const { ActivityType } = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 */
module.exports = async (client) => {
  client.logger.success(`Logged in as ${client.user.username}!`);

  // Initialize Music Manager
  if (client.config.MUSIC.ENABLED) {
    client.manager.init({ ...client.user, shards: "auto" });
    client.logger.success("Music Manager initialized");
  }

  // Initialize Giveaways Manager
  if (client.config.GIVEAWAYS.ENABLED) {
    client.logger.log("Initializing giveaways manager...");
    client.giveawaysManager._init().then((_) => client.logger.success("Giveaway Manager initialized"));
  }

  // Set Bot Presence directly
  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: "Senpai | /help", // Activity name
        type: ActivityType.Listening, // Activity type
      },
    ],
  });

  // Register Interactions
  if (client.config.INTERACTIONS.SLASH || client.config.INTERACTIONS.CONTEXT) {
    if (client.config.INTERACTIONS.GLOBAL) await client.registerInteractions();
    else await client.registerInteractions(client.config.INTERACTIONS.TEST_GUILD_ID);
  }

  // Load reaction roles to cache
  await cacheReactionRoles(client);

  for (const guild of client.guilds.cache.values()) {
    const settings = await getSettings(guild);

    // initialize counter
    if (settings.counters.length > 0) {
      await counterHandler.init(guild, settings);
    }

    // cache invites
    if (settings.invite.tracking) {
      inviteHandler.cacheGuildInvites(guild);
    }
  }

  setInterval(() => counterHandler.updateCounterChannels(client), 10 * 60 * 1000);
};
