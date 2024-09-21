import {
  type ChatSession,
  type GenerateContentStreamResult,
  type GenerativeModel,
  GoogleGenerativeAI,
  Part,
} from "@google/generative-ai";
import i18n from "./i18n";

const MODEL_NAME = "gemini-1.5-flash";

let genAI: GoogleGenerativeAI;

export class ModelState {
  private model: GenerativeModel | null = null;
  private chat: ChatSession | null = null;

  constructor(prompt?: string) {
    if (!genAI) {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    this.init(prompt);
  }

  init(prompt?: string): ModelState {
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
