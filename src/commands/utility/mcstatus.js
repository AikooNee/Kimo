const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const axios = require("axios");

module.exports = {
  name: "mcstatus",
  description: "Retrieve information about a Minecraft server.",
  cooldown: 0,
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  userPermissions: [],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "server",
        description: "IP address or server domain.",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async interactionRun(interaction, data) {
    const name = interaction.options.getString("server");
    const response = await mcstatus(interaction, name);
    await interaction.followUp(response);
  },
};

async function mcstatus(context, serverIP) {
  try {
    const response = await axios.get(`https://api.mcsrvstat.us/2/${encodeURIComponent(serverIP)}`);
    const serverData = response.data;

    if (serverData.ip === undefined) {
      const invalidIPEmbed = new EmbedBuilder()
        .setDescription("Please provide a valid Minecraft server IP or domain.")
        .setColor(EMBED_COLORS.ERROR);
      return { embeds: [invalidIPEmbed] };
    } else {
      const thumbnail = serverData.icon
        ? `data:image/png;base64,${serverData.icon.replace("data:image/png;base64,", "")}`
        : "";

      const embed = new EmbedBuilder()
        .setTitle(serverData.hostname)
        .setDescription(`IP: ${serverData.ip}\nPort: ${serverData.port}`)
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(thumbnail)
        .addFields(
          { name: "Players", value: `${serverData.players.online}/${serverData.players.max}`, inline: true },
          { name: "Version", value: serverData.version, inline: true },
          { name: "Online", value: serverData.online ? "Yes" : "No", inline: true },
          { name: "Description", value: serverData.motd.clean.join("\n") || "No description", inline: false },
          { name: "Cracked", value: serverData.players.sample ? "Yes" : "No", inline: true }
        );
      return { embeds: [embed] };
    }
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setDescription("An error occurred while fetching server data. Please try again later.")
      .setColor(EMBED_COLORS.ERROR);
    return { embeds: [errorEmbed] };
  }
}
