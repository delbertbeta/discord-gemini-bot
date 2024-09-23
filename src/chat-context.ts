import {
  type ChatSession,
  type GenerateContentStreamResult,
  type GenerativeModel,
  GoogleGenerativeAI,
  Part,
} from "@google/generative-ai";
import { ChannelType } from 'discord.js';
import i18n from "./i18n";

const MODEL_NAME = "gemini-1.5-flash";

export enum ChatContextType {
  "DM" = "DM",
  "Channel" = "Channel",
}

let genAI: GoogleGenerativeAI;

export class ChatContext {
  private model: GenerativeModel | null = null;
  private chat: ChatSession | null = null;

  constructor(prompt?: string) {
    if (!genAI) {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    this.init(prompt);
  }

  init(prompt?: string): ChatContext {
    this.model = genAI.getGenerativeModel({ model: MODEL_NAME });
    this.chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: prompt ?? i18n.t("prompt.assistant"),
            },
          ],
        },
      ],
    });
    return this;
  }

  async sendMessageStream(
    message: Array<string | Part> | string
  ): Promise<GenerateContentStreamResult> {
    return await this.chat.sendMessageStream(message);
  }
}

export class ChatContextManager {
  static getChatContextTypeFromChannelType(channelType: ChannelType) {
    return channelType === ChannelType.DM
      ? ChatContextType.DM
      : ChatContextType.Channel;
  }

  /** Gives each channel its own chat context. Keys: {ChatContextType}_{Channel ID|DM User ID}. */
  private _chatContextMap = new Map<string, ChatContext>();

  private _generateMapKey(type: ChatContextType, id: string) {
    return `${type}_${id}`;
  }

  has(type: ChatContextType, id: string) {
    return this._chatContextMap.has(this._generateMapKey(type, id));
  }

  get(type: ChatContextType, id: string) {
    return this._chatContextMap.get(this._generateMapKey(type, id));
  }

  create(type: ChatContextType, id: string) {
    const context = new ChatContext();
    this._chatContextMap.set(this._generateMapKey(type, id), context);
    return context;
  }

  delete(type: ChatContextType, id: string) {
    return this._chatContextMap.delete(this._generateMapKey(type, id));
  }

  getOrCreate(type: ChatContextType, id: string) {
    return this.has(type, id) ? this.get(type, id) : this.create(type, id);
  }
}
