const { botKnowledge, safetySettings } = require("@helpers/botKnowledge");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { AttachmentBuilder } = require("discord.js");
const aaruTranslator = require("aaru-translator");
const { AI_CHAT } = require("@root/config");
const axios = require("axios");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: AI_CHAT.MODEL,
  safetySettings,
  systemInstruction: AI_CHAT.PERSONALITY,
  generationConfig: {
    maxOutputTokens: 2048,
    stopSequences: ["sex"],
    temperature: 1.0,
    topK: 1,
    topP: 1,
  },
});

const users = new Map();

async function chatbot(client, message, settings) {
  if (!AI_CHAT.ENABLED || !message.guild || message.author.bot) return;

  const regex = new RegExp(`^<@!?${client.user.id}>`);
  const content = message.content.replace(regex, "").trim();
  const attachment = message.attachments.first();
  const mention = message.content.match(regex);

  if (!content && !attachment) return;
  if (!(mention || message.channel.id === settings.chatbot.channel)) return;

  message.channel.sendTyping();

  let data = users.get(message.author.id) || { cooldown: 0, chat: [] };

  if (Date.now() - data.cooldown < AI_CHAT.COOLDOWN * 1000) {
    const remaining = Math.ceil(
      (AI_CHAT.COOLDOWN * 1000 - (Date.now() - data.cooldown)) / 1000
    );
    const msg = await message.safeReply(
      `Please wait ${remaining} more seconds before chatting again.`
    );
    return setTimeout(
      () => msg.deletable && msg.delete().catch(() => {}),
      5000
    );
  }

  data.cooldown = Date.now();

  try {
    if (message.author) {
      botKnowledge.push({
        role: "user",
        parts: [{ text: `I am ${message.author.username}` }],
      });
    }

    if (
      data.chat.length >= 2 &&
      data.chat[data.chat.length - 2].parts[0].text === content
    ) {
      return message.safeReply(data.chat[data.chat.length - 1].parts[0].text);
    }

    const history = [...botKnowledge, ...data.chat];
    let result;

    if (attachment) {
      const imagePart = {
        inlineData: {
          data: Buffer.from(
            (await axios.get(attachment.url, { responseType: "arraybuffer" })).data,
            "binary"
          ).toString("base64"),
          mimeType: attachment.contentType,
        },
      };
      result = await model.startChat({ history }).sendMessage([imagePart]);
    } else {
      result = await model.startChat({ history }).sendMessage(content);
    }

    let reply = result.response.text();

    data.chat.push(
      { role: "user", parts: [{ text: content }] },
      { role: "model", parts: [{ text: reply }] }
    );

    if (data.chat.length > (AI_CHAT.MAX_HISTORY || 5) * 2) {
      data.chat = data.chat.slice(-(AI_CHAT.MAX_HISTORY || 5) * 2);
    }

    if (AI_CHAT.TRANSLATE) {
      reply = await aaruTranslator.translate(
        "auto",
        settings.chatbot.language || AI_CHAT.DEFAULT_LANG,
        reply
      );
    }

    if (AI_CHAT.ANTI_LINKS) {
      reply = reply.replace(/\b(?:https?|ftp):\/\/\S+/gi, "").trim();
    }

    if (reply.length > 2000) {
      const attachment = new AttachmentBuilder(Buffer.from(reply, "utf-8"), { name: "response.txt" });
      return message.safeReply({
        content: "The response was too long to send directly, so it has been sent as a text file instead.",
        files: [attachment],
      });
    } else {
      return message.safeReply(reply);
    }
  } catch (error) {
    client.logger.error(error);
    message.safeReply(
      "Oops! Something went wrong while processing your request. Please try again later."
    );
  } finally {
    users.set(message.author.id, data);
  }
}

module.exports = { chatbot };
