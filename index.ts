import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import {
  GoogleGenerativeAI,
  ChatSession,
  GenerativeModel,
} from "@google/generative-ai";
import { replaceWithObjectValues } from "./utils";

dotenv.config();

const MODEL_NAME = "gemini-1.5-flash";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let model: GenerativeModel | undefined;
let chat: ChatSession | undefined;

client.on("ready", () => {
  console.log(`Bot is ready! Logged in as ${client.user?.tag}.`);
});

client.on("messageCreate", async (message) => {
  // Ignores bot message requests.
  if (message.author.bot || !client.user) return;

  // Tests if the message mentions this bot. `client.user` is the discord bot user.
  if (message.mentions.has(client.user)) {
    let userMessage = message.content
      .replace(`<@!${client.user.id}>`, "")
      .trim();

    userMessage = replaceWithObjectValues(userMessage, message.mentions.users);

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
        text: `你是一个 Discord 机器人，请只回答用户提出的问题本身。\n以下是用户的输入：\n${userMessage}`,
      },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
    });

    model = undefined;

    const reply = result.response.text();
    // due to Discord limitations, we can only send 2000 characters at a time, so we need to split the message
    if (reply.length > 2000) {
      const replyArray = reply.match(/[\s\S]{1,2000}/g);
      replyArray!.forEach(async (msg) => {
        await message.reply(msg);
      });
      return;
    }

    message.reply(reply);
  }
});

client.login(process.env.DISCORD_API_KEY);
