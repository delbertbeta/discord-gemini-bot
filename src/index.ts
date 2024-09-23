import dotenv from "dotenv";
dotenv.config();

import { Client, REST, Events, GatewayIntentBits, Partials } from "discord.js";
import { registerCommandInteraction, registerCommands } from "./command";
import { ChatContextManager } from "./chat-context";
import { registerMessageHandler } from "./message";
import { inspect } from "util";
import i18n from "./i18n";

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  if (!process.env.DISCORD_API_KEY) {
    throw new Error("DISCORD_API_KEY is not set");
  }
  if (!process.env.DISCORD_CLIENT_ID) {
    throw new Error("DISCORD_CLIENT_ID is not set");
  }
  if (
    process.env.VERBOSITY &&
    process.env.VERBOSITY.toLowerCase() === "debug"
  ) {
    inspect.defaultOptions.depth = 10;
    Error.stackTraceLimit = Infinity;
  }

  await i18n.initializeConfig();

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [
      Partials.Channel, // Required to receive DMs
    ],
  });
  const rest = new REST().setToken(process.env.DISCORD_API_KEY);

  const chatContextManager = new ChatContextManager();

  registerCommands(rest);

  client.on(Events.ClientReady, () => {
    console.log(`Bot is ready! Logged in as ${client.user?.tag}.`);
  });

  registerCommandInteraction(client, chatContextManager);

  registerMessageHandler(client, chatContextManager);

  process.on("uncaughtException", handleUncaughtException);
  process.on("unhandledRejection", handlePromiseRejection);

  function handleUncaughtException(
    error: Error,
    origin: NodeJS.UncaughtExceptionOrigin
  ) {
    console.error(`${origin}:`, error);
  }

  function handlePromiseRejection(error: unknown, promise: Promise<unknown>) {
    if (error instanceof Error) {
      handleUncaughtException(error, "unhandledRejection");
    }
  }

  client.login(process.env.DISCORD_API_KEY);
}

main();
