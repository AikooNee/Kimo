const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const util = require('util');
const { exec } = require("child_process");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "exec",
  description: "execute something on terminal",
  category: "OWNER",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<script>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: false,
    options: [
      {
        name: "script",
        description: "script to execute",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
     message.channel.safeSend({
      embeds:[
        new EmbedBuilder()
        .setTitle('Spawning Shell...')
        .setDescription(`Executing command...`)
        .setAuthor({ name: message.client.user.displayName, iconURL: message.client.user.displayAvatarURL() })
      ]
     })
    const script = args.join(" ");
    const result =  await execute(script);
    message.channel.safeSend({ embeds: result });
  },

  async interactionRun(interaction) {
    const script = interaction.options.getString("script");
   await interaction.followUp({
      embeds:[
        new EmbedBuilder()
        .setTitle('Spawning Shell...')
        .setDescription(`Executing command...`)
        .setAuthor({ name: interaction.client.user.displayName, iconURL: interaction.client.user.displayAvatarURL() })
      ]
     })

     const result =  await execute(script);
     interaction.channel.send({ embeds: result });
  }
}

async function execute(script) {
    try {
    const { stdout } =  await util.promisify(exec)(script);
    const outputEmbed = new EmbedBuilder()
    .setTitle('📥 Output')
    .setDescription(`\`\`\`bash\n${stdout.length > 4096 ? `${stdout.substr(0, 4000)}...` : stdout}\n\`\`\``)
    .setColor(EMBED_COLORS.SUCCESS)
    .setTimestamp();
    return [outputEmbed]

    } catch (err) {
    const errorEmbed = new EmbedBuilder()
    .setTitle('☢️ Error')
    .setDescription(`\`\`\`bash\n${err}\n\`\`\``)
    .setColor(EMBED_COLORS.ERROR)
    .setTimestamp();
    return [errorEmbed]
    }
}