const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const { EMBED_COLORS } = require("@root/config.js");

const BASE_URL = "https://weeb-api.vercel.app/waifu";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "waifu",
  description: "Get a random waifu image",
  category: "ANIME",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 0,
    usage: "",
  },
  slashCommand: {
    enabled: true,
    options: [],
  },

  async messageRun(message) {
    const response = await getRandomWaifuImage();
    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await getRandomWaifuImage();
    await interaction.followUp(response);
  },
};

async function getRandomWaifuImage() {
  try {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error("HTTP error");
    }

    const imageUrl = response.url;

    if (imageUrl) {
      const embed = new EmbedBuilder()
        .setImage(imageUrl)
        .setColor(EMBED_COLORS.BOT_EMBED);

      return { embeds: [embed] };
    } else {
      throw new Error("Unexpected response from Waifu API");
    }
  } catch {
    return { embeds: [new EmbedBuilder().setDescription("Something went wrong while fetching the Waifu image.").setColor(EMBED_COLORS.ERROR)] };
  }
}
