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
      console.error("Register application command failed:", e);
      if (e?.message?.includes("Connect Timeout Error")) {
        console.error("[NOTE] Please check your connection with Discord.");
      }
    });
}

export function registerCommandInteraction(
  client: Client<boolean>,
  modelStateMap: Map<string, ModelState>
) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (
      !interaction.isChatInputCommand() ||
      !modelStateMap.has(interaction.channelId)
    )
      return;

    if (interaction.commandName === "clear") {
      modelStateMap.delete(interaction.channelId);

      try {
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
      } catch (error) {
        console.error("Failed to send reply to `clear` command:", error);
      }
    }
  });
}
