import { Client, Events, REST, Routes, SlashCommandBuilder } from "discord.js";
import { ChatContextManager, ChatContextType } from "./chat-context";
import i18n from "./i18n";

export function registerCommands(rest: REST) {
  const commands = [
    new SlashCommandBuilder()
      .setName("clear")
      .setDescription(i18n.t("command.clear.description")),
  ];

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
  chatContextManager: ChatContextManager
) {
  client.on(Events.InteractionCreate, async (interaction) => {
    const chatContextKey = !interaction.guildId
      ? interaction.user.id
      : interaction.channelId;

    const chatContextType = !interaction.guildId
      ? ChatContextType.DM
      : ChatContextType.Channel;

    if (
      !interaction.isChatInputCommand() ||
      !chatContextManager.has(chatContextType, chatContextKey)
    )
      return;

    if (interaction.commandName === "clear") {
      chatContextManager.delete(chatContextType, chatContextKey);

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: i18n.t("command.clear.response"),
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: i18n.t("command.clear.response"),
            ephemeral: true,
          });
        }
      } catch (error) {
        console.error("Failed to send reply to `clear` command:", error);
      }
    }
  });
}
