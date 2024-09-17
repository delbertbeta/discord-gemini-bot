require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const {
  GoogleGenerativeAI,
  ChatSession,
  GenerativeModel,
} = require("@google/generative-ai");

const MODEL_NAME = "gemini-1.5-flash";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/** @type {GenerativeModel} */
let model;
/** @type {ChatSession} */
let chat;

client.on("ready", () => {
  console.log(`Bot is ready! Logged in as ${client.user.tag}.`);
});

client.on("messageCreate", async (message) => {
  // Ignores bot message requests.
  if (message.author.bot) return;

  // Tests if the message mentions this bot. `client.user` is the discord bot user.
  if (message.mentions.has(client.user)) {
    // Removes the at-string to this bot.
    const userMessage = message.content
      .replace(`<@!${client.user.id}>`, "")
      .trim();

    if (!model) {
      model = genAI.getGenerativeModel({ model: MODEL_NAME });
      chat = model.startChat();
    }

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const parts = [
      {
        text: `input: ${userMessage}`,
      },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
    });

    model = undefined;

    const reply = await result.response.text();
    // due to Discord limitations, we can only send 2000 characters at a time, so we need to split the message
    if (reply.length > 2000) {
      const replyArray = reply.match(/[\s\S]{1,2000}/g);
      replyArray.forEach(async (msg) => {
        await message.reply(msg);
      });
      return;
    }

    message.reply(reply);
  }
});

client.login(process.env.DISCORD_API_KEY);
