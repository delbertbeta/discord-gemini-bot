import { Client, Events, REST, Routes, SlashCommandBuilder } from "discord.js";
import type { ModelState } from "./model";

const commands = [
  new SlashCommandBuilder()
    .setName("clear")
    .setDescription(
      "Clear context but not support async! It will crash if you call this while other using this bot."
    ),
];

export function registerCommands(rest: REST) {
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
}

export function registerCommandInteraction(
  client: Client<boolean>,
  modelState: ModelState
) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "clear") {
      modelState.clear();

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
}
