import { formatString } from "../utils";

export class I18n {
  lang: "en" | "zh" | string;
  config: Record<string, string | object>;

  constructor(lang: I18n["lang"]) {
    this.lang = lang;
    this.initializeConfig();
  }

  async initializeConfig() {
    try {
      this.config = await import(`./${this.lang}.json`);
    } catch (e) {
      throw new Error(`language ${this.lang} is not supported`);
    }
  }

  t(
    path: string,
    formatArgs?: any[] | Record<PropertyKey, any>
  ): string | undefined {
    const keys = path.split(".");

    let template: any = this.config;
    for (const key of keys) {
      template = template[key];
      if (template === undefined) {
        return;
      }
    }

    if (typeof template === "string" && formatArgs) {
      template = formatString(template, formatArgs);
    }

    return template;
  }
}

export default new I18n(process.env.LANG ? process.env.LANG.slice(0, 2) : "zh");
