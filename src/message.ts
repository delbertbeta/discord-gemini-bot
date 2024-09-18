import { Events, type Client, type Message } from "discord.js";
import { replaceWithObjectValues } from "./utils";
import type { ModelState } from "./model";
import i18n from "./i18n";

export function registerMessageHandler(
  client: Client<boolean>,
  modelState: ModelState
) {
  client.on(Events.MessageCreate, async (message) => {
    // Ignores bot message requests.
    if (message.author.bot || !client.user) return;

    // Tests if the message mentions this bot. `client.user` is the discord bot user.
    if (message.mentions.has(client.user)) {
      let userMessage = message.content
        .replace(`<@!${client.user.id}>`, "")
        .trim();

      userMessage = replaceWithObjectValues(
        userMessage,
        message.mentions.users
      );

      if (!modelState.inited) {
        modelState.init();
      }

      try {
        const result = await modelState.chat.sendMessageStream(
          i18n.t("prompt.chatPrefix", [userMessage])
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
      } catch (error) {
        console.error("Failed to send response:", error);
        if (
          error?.message?.includes(
            "User location is not supported for the API use"
          )
        ) {
          console.error(
            "[NOTE] Please make sure your requests are from locations supported by Google Gemini and then restart this bot."
          );
        }
      }
    }
  });
}
