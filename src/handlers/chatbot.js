const { botKnowledge, safetySettings } = require("@helpers/botKnowledge");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const aaruTranslator = require("aaru-translator");
const axios = require('axios');

const genAIKey = process.env.GEMINI_API_KEY;

const TRANSLATOR = true;
const LINK_DETECTION = false;
const COOLDOWN = null;
const IDLE_TIME = 15000;
const MAX_HISTORY = 6;

let genAI, textModels = {}, imageModels = {};

const textConfig = {
  stopSequences: ["red"],
  maxOutputTokens: 2048,
  temperature: 0.8,
  top_p: 1,
  top_k: 1,
};

const imageConfig = {
  stopSequences: ["red"],
  temperature: 0.4,
  topP: 1,
  topK: 32,
  maxOutputTokens: 2048,
};

if (genAIKey) {
  genAI = new GoogleGenerativeAI(genAIKey);
}

const cache = {};
const history = {};
const cooldown = new Map();
const idleTime = new Map();

async function updateHistory(userId, messageData) {
  if (!history[userId]) {
    history[userId] = [];
  }

  if (history[userId].length >= MAX_HISTORY) {
    // Overwrite the oldest message with the new message
    history[userId][0] = messageData;
  } else {
    history[userId].push(messageData);
  }
}

async function translate(text, language) {
  if (TRANSLATOR) {
    return aaruTranslator.translate("auto", language || "en", text);
  } else {
    return text;
  }
}

async function updateCooldown(userId) {
  cooldown.set(userId, Date.now() + COOLDOWN);
}

async function checkCooldown(userId) {
  const now = Date.now();
  if (cooldown.has(userId) && now < cooldown.get(userId)) {
    const clTime = Math.ceil((cooldown.get(userId) - now) / 1000);
    return `Oh no! You need to wait ${clTime} more seconds before chatting with me again!`;
  }
  return null;
}

async function updateIdleTime(userId, guildId) {
  idleTime.set(`${userId}-${guildId}`, Date.now());
}

async function TextResponse(message, prompt, userId, settings) {
  const clSend = await checkCooldown(userId);
  if (clSend) return clSend;
  updateCooldown(userId);

  const userMessages = history[userId] ? history[userId].filter(msg => msg.role === "user") : [];
  const chatHistory = userMessages.slice(-MAX_HISTORY).map(msg => ({ role: "user", parts: [{ text: msg.text }] }));

  if (message.author) {
    botKnowledge.push(
      { role: "user", parts: [{ text: "Who am I" }] },
      { role: "model", parts: [{ text: `You are ${message.author.displayName}` }] },
      { role: "user", parts: [{ text: "What's my name?" }] },
      { role: "model", parts: [{ text: `Your name is ${message.author.displayName}` }] }
    );
  }

  if (!textModels[userId]) {
    textModels[userId] = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      apiVersion: 'v1beta',
      configuration: { ...textConfig, safetySettings }
    });
  }

  const chat = textModels[userId].startChat({
    history: [
      ...chatHistory,
      ...botKnowledge
    ],
    generationConfig: textConfig,
    safetySettings,
  });

  await message.channel.sendTyping();

  try {
    const genAIResponse = await (await chat.sendMessage(prompt)).response;
    let text = genAIResponse.text();

    if (LINK_DETECTION && /\b(?:https?|ftp):\/\/\S+/gi.test(text)) {
      return "Sorry, I can't assist you with links";
    }

    return text.length > 2000 ? text.slice(0, 1997) + '...' : text;
  } catch (error) {
    message.client.logger.error(error);
    return "Oops! Something went wrong while processing your request.";
  }
}

async function ImageResponse(message, imageUrl, prompt, userId, settings) {
  const clSend = await checkCooldown(userId);
  if (clSend) return clSend;
  updateCooldown(userId);

  if (!imageModels[userId]) {
    imageModels[userId] = genAI.getGenerativeModel({
      model: "gemini-pro-vision",
      apiVersion: 'v1beta',
      configuration: { ...imageConfig, safetySettings }
    });
  }

  try {
    const imageData = Buffer.from((await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    })).data, 'binary').toString('base64');
    const promptConfig = [{
      text: prompt || "Tell me about this image"
    }, {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageData
      }
    }];
    await message.channel.sendTyping();

    const genAIResponse = await (await imageModels[userId].generateContent({
      contents: [{
        role: "user",
        parts: promptConfig
      }]
    })).response;
    let text = genAIResponse.text();

    if (LINK_DETECTION && /\b(?:https?|ftp):\/\/\S+/gi.test(text)) {
      return "Sorry, I can't assist you with links";
    }

    return text;
  } catch (error) {
    message.client.logger.error(error);
    return "Oops! Something went wrong while processing the image.";
  }
}

async function getTextResponse(message, messageContent, userId, settings) {
  const response = await TextResponse(message, messageContent, userId, settings);
  return translate(response, settings.chatbot.language);
}

async function getImageResponse(message, imageUrl, prompt, userId, settings) {
  const response = await ImageResponse(message, imageUrl, prompt, userId, settings);
  return translate(response, settings.chatbot.language);
}

async function updateCache(userId, messageContent, response) {
  if (!cache[userId]) {
    cache[userId] = [];
  }
  cache[userId].push({ message: messageContent, response });
}

async function isCached(userId, messageContent) {
  if (cache[userId] && cache[userId].length > 0) {
    const lastCachedEntry = cache[userId][cache[userId].length - 1];
    return lastCachedEntry.message === messageContent ? lastCachedEntry.response : null;
  }
  return null;
}

async function chatbot(client, message, settings) {
  try {
    if (!message.guild || message.author.bot) return;

    const now = Date.now();
    const MentionRegex = new RegExp(`^<@!?${message.client.user.id}>`);
    const userId = message.author.id;
    const guildId = message.guild.id;

    if (message.content.match(MentionRegex) || now - (idleTime.get(`${userId}-${guildId}`) || 0) < IDLE_TIME) {
      const messageContent = message.content.replace(MentionRegex, '').trim();
      updateIdleTime(userId, guildId); // Update idle time for the current guild
      if (messageContent) {
        const cachedResponse = await isCached(userId, messageContent);
        if (cachedResponse) {
          return message.safeReply(cachedResponse);
        }
        const imageUrl = message.attachments.first()?.url;
        const response = await (imageUrl && message.attachments.first().height ?
          getImageResponse(message, imageUrl, messageContent, userId, settings) :
          getTextResponse(message, messageContent, userId, settings));
        await updateCache(userId, messageContent, response);
        return message.safeReply(response);
      }
    }

    if (message.channel.id === settings.chatbot.channel) {
      const messageContent = message.content.trim();
      const cachedResponse = await isCached(userId, messageContent);
      if (cachedResponse) {
        return message.safeReply(cachedResponse);
      }
      
      const imageUrl = message.attachments.first()?.url;
      console.log(imageUrl);
      const response = await (imageUrl && message.attachments.first().height ?
        getImageResponse(message, imageUrl, messageContent, userId, settings) :
        getTextResponse(message, messageContent, userId, settings));
      await updateCache(userId, messageContent, response);
      return message.safeReply(response);
    }
  } catch (error) {
    client.logger.error(error);
    message.safeReply("Oops! Something went wrong while processing your request. Please try again later.");
  }
}

module.exports = { chatbot };