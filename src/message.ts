import { ChannelType, Events, type Client, type Message } from "discord.js";
import { convertImagesToPart, replaceWithObjectValues } from "./utils";
import { ModelState } from "./model";
import i18n from "./i18n";

export function registerMessageHandler(
  client: Client<boolean>,
  modelStateMap: Map<string, ModelState>
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

      let modelKey =
        message.channel.type === ChannelType.DM
          ? message.author.id
          : message.channelId;

      if (!modelStateMap.has(modelKey)) {
        modelStateMap.set(modelKey, new ModelState().init());
      }

      try {
        const modelState = modelStateMap.get(modelKey)!;

        const result = await modelState.sendMessageStream([
          i18n.t("prompt.chatPrefix", [userMessage]),
          ...(await Promise.all(
            message.attachments
              .filter((attachment) =>
                attachment.contentType.startsWith("image")
              )
              .map(convertImagesToPart)
          )),
        ]);

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
          modelStateMap.delete(modelKey);
        }
      }
    }
  });
}
