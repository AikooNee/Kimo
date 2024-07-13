const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const fetch = require("node-fetch");
const { getRandomInt } = require("@helpers/Utils");

const {
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_USERNAME,
  REDDIT_PASSWORD,
} = process.env;

module.exports = {
  name: "meme",
  description: "Get a random meme",
  category: "FUN",
  botPermissions: ["EmbedLinks"],
  cooldown: 10,
  command: {
    enabled: true,
    usage: "<category>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "category",
        description: "Category of the meme",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const choice = args.join(" ") || null;
    const response = await getRandomEmbed(choice);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("category");
    const response = await getRandomEmbed(choice);
    await interaction.followUp(response);
  },
};

async function getRedditAccessToken() {
  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "password",
      username: REDDIT_USERNAME,
      password: REDDIT_PASSWORD,
    }),
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get Reddit access token: ${response.statusText}`);
  }

  const { access_token } = await response.json();
  return access_token;
}

async function getRandomEmbed(choice) {
  const subReddits = ["meme", "memes", "Memes_Of_The_Dank", "dankmemes"];
  const subreddit = choice || subReddits[getRandomInt(subReddits.length)];
  const url = `https://www.reddit.com/r/${subreddit}/random.json`;
  const accessToken = await getRedditAccessToken();

  const response = await fetch(url, {
    headers: {
      Authorization: accessToken,
      "User-Agent": "Discord Bot (by /u/aarubot)",
    },
  });

  if (!response.ok) {
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription("Failed to fetch meme. Try again!"),
      ],
    };
  }

  const json = await response.json();

  if (!json.length || json[0].data.children[0].data.over_18) {
    const message = !json.length
      ? `No meme found matching ${choice}`
      : "This meme contains NSFW content";
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription(message),
      ],
    };
  }

  const {
    permalink,
    url: memeImage,
    title: memeTitle,
    ups: memeUpvotes,
    num_comments: memeNumComments,
  } = json[0].data.children[0].data;
  const memeUrl = `https://www.reddit.com${permalink}`;

  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(memeTitle)
        .setURL(memeUrl)
        .setImage(memeImage)
        .setColor("Random")
        .setFooter({ text: `👍 ${memeUpvotes} | 💬 ${memeNumComments}` }),
    ],
  };
}
