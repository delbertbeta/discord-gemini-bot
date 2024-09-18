import {
  ChatSession,
  GenerativeModel,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import i18n from "./i18n";

const MODEL_NAME = "gemini-1.5-flash";

let genAI: GoogleGenerativeAI;

export class ModelState {
  model: GenerativeModel | null = null;
  chat: ChatSession | null = null;

  constructor() {
    if (!genAI) {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  clear(): void {
    this.model = null;
    this.chat = null;
  }

  get inited(): boolean {
    return !!this.model && !!this.chat;
  }

  init(prompt?: string): void {
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
  }
}
