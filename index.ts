import dotenv from "dotenv";
import { Client, REST, Events, GatewayIntentBits } from "discord.js";
import { registerCommandInteraction, registerCommands } from "./src/command";
import { ModelState } from "./src/model";
import { registerMessageHandler } from "./src/message";
import { inspect } from "util";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}
if (!process.env.DISCORD_API_KEY) {
  throw new Error("DISCORD_API_KEY is not set");
}
if (!process.env.DISCORD_CLIENT_ID) {
  throw new Error("DISCORD_CLIENT_ID is not set");
}
if (process.env.VERBOSITY && process.env.VERBOSITY.toLowerCase() === "debug") {
  inspect.defaultOptions.depth = 10;
  Error.stackTraceLimit = Infinity;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const rest = new REST().setToken(process.env.DISCORD_API_KEY);

const modelState = new ModelState();

registerCommands(rest);

client.on(Events.ClientReady, () => {
  console.log(`Bot is ready! Logged in as ${client.user?.tag}.`);
});

registerCommandInteraction(client, modelState);

registerMessageHandler(client, modelState);

process.on("uncaughtException", handleUncaughtException);
process.on("unhandledRejection", handlePromiseRejection);

function handleUncaughtException(
  error: Error,
  origin: NodeJS.UncaughtExceptionOrigin
) {
  // Handle unexpected errors.
}

function handlePromiseRejection(error: unknown, promise: Promise<unknown>) {
  if (error instanceof Error) {
    handleUncaughtException(error, "unhandledRejection");
  }
}

client.login(process.env.DISCORD_API_KEY);
