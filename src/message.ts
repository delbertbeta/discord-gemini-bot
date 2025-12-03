import { ChannelType, Events, type Client, type Message } from "discord.js";
import { convertImagesToPart, replaceWithObjectValues } from "./utils";
import { ChatContextManager } from "./chat-context";
import i18n from "./i18n";

export function registerMessageHandler(
  client: Client<boolean>,
  chatContextManager: ChatContextManager
) {
  client.on(Events.MessageCreate, async (message) => {
    // Ignores bot message requests.
    if (message.author.bot || !client.user) return;

    // Tests if the message mentions this bot. `client.user` is the discord bot user.
    if (
      message.mentions.has(client.user) ||
      message.channel.type === ChannelType.DM
    ) {
      let userMessage = message.content
        .replace(`<@!${client.user.id}>`, "")
        .trim();

      userMessage = replaceWithObjectValues(
        userMessage,
        message.mentions.users
      );

      const chatContextKey =
        message.channel.type === ChannelType.DM
          ? message.author.id
          : message.channelId;

      const chatContextType =
        ChatContextManager.getChatContextTypeFromChannelType(
          message.channel.type
        );

      const chatContext = chatContextManager.getOrCreate(
        chatContextType,
        chatContextKey
      );

      try {
        const result = await chatContext.sendMessageStream([
          i18n.t("prompt.chatPrefix", [userMessage]),
          ...(await Promise.all(
            message.attachments
              .filter((attachment) =>
                attachment.contentType.startsWith("image")
              )
              .map(convertImagesToPart)
          )),
        ]);

        const MAX_LENGTH = 2000;
        let pendingText = "";
        let lastMessage: Message | null = null;

        for await (const chunk of result.stream) {
          pendingText += chunk.text();

          while (pendingText.length >= MAX_LENGTH) {
            const chunkToSend = pendingText.slice(0, MAX_LENGTH);
            if (lastMessage) {
              lastMessage = await lastMessage.reply(chunkToSend);
            } else {
              lastMessage = await message.reply(chunkToSend);
            }
            pendingText = pendingText.slice(MAX_LENGTH);
          }

          if (lastMessage && pendingText.length > 0) {
            await lastMessage.edit(pendingText);
          }
        }

        if (pendingText.length > 0) {
          if (lastMessage) {
            await lastMessage.edit(pendingText);
          } else {
            await message.reply(pendingText);
          }
        }
      } catch (error) {
        console.error("Failed to send response:", error);

        try {
          await message.reply(
            i18n.t("error.unknown", [
              error?.message || error?.toString() || "unknown",
            ])
          );
        } catch (e) {
          console.error("Failed to send error message:", e);
        }
        if (
          error?.message?.includes(
            "User location is not supported for the API use"
          )
        ) {
          console.error(
            "[NOTE] Please make sure your requests are from locations supported by Google Gemini and then restart this bot."
          );
        } else if (
          error?.message?.includes("Candidate was blocked due to SAFETY")
        ) {
          console.error("Resetting model...");
          chatContextManager.delete(chatContextType, chatContextKey);
        }
      }
    }
  });
}
