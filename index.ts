import dotenv from "dotenv";
import {
  Client,
  REST,
  Events,
  GatewayIntentBits,
  Message,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import {
  GoogleGenerativeAI,
  ChatSession,
  GenerativeModel,
} from "@google/generative-ai";
import { replaceWithObjectValues } from "./src/utils";

dotenv.config();

const MODEL_NAME = "gemini-1.5-flash";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const rest = new REST().setToken(process.env.DISCORD_API_KEY);

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let model: GenerativeModel | undefined;
let chat: ChatSession | undefined;

const commands = [
  new SlashCommandBuilder()
    .setName("clear")
    .setDescription(
      "Clear context but not support async! It will crash if you call this while other using this bot."
    ),
];

rest
  .put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
    body: commands,
  })
  .then(() => {
    console.log("Successfully registered application commands.");
  })
  .catch((e) => {
    console.error("Register application command failed", e);
  });

client.on(Events.ClientReady, () => {
  console.log(`Bot is ready! Logged in as ${client.user?.tag}.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "clear") {
    model = undefined;
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "Gemini context cleared.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "Gemini context cleared.",
        ephemeral: true,
      });
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
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
      chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [
              {
                text: "你是一个 Discord 机器人，请用友好、简练、有条理的方式组织回答，只回答用户提出的问题本身。",
              },
            ],
          },
        ],
      });
    }

    const result = await chat.sendMessageStream(
      `请结合上下文，用友好、简练、有条理的方式组织语言继续回答用户输入：\n以下是用户的输入：\n${userMessage}`
    );

    let replyText = "";
    let replyMessage: Message | undefined;

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      replyText += chunkText;
      if (!replyMessage) {
        replyMessage = await message.reply(replyText);
      } else {
        await replyMessage.edit(replyText);
      }
    }
  }
});

client.login(process.env.DISCORD_API_KEY);
