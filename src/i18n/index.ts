export class I18n {
  lang: "zh" | string;
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

    let v: any = this.config;
    for (const key of keys) {
      v = v[key];
      if (v === undefined) {
        return;
      }
    }

    if (typeof v === "string" && formatArgs) {
      const matches = v.matchAll(/(?<!\\)\{([^\}]+)\}/g);
      for (const m of matches) {
        v =
          v.slice(0, m.index) +
          formatArgs[m[1] as any] +
          v.slice(m.index + m.length);
      }
    }

    return v;
  }
}

export default new I18n(process.env.LANG ? process.env.LANG.slice(0, 2) : "zh");
