import type { User } from "discord.js";

export function replaceWithObjectValues(str: string, obj: Map<string, User>) {
  // 正则表达式：匹配以@开头，后面跟着一串数字
  const regex = /@(\d+)/g;

  return str.replace(regex, (match, p1) => {
    // p1 捕获组，包含匹配到的数字
    return `@${obj.get(p1)?.displayName ?? p1}`; // 如果对象中没有对应值，则返回原来的数字
  });
}

/**
 * Interpolates a string, replacing curly brace embraced strings with some
 * arguments.
 *
 * @example
 * formatString("no interpolation", [0]) === "no interpolation"
 * formatString("{0} + {0} = 2 * {0}", [42]) === "42 + 42 = 2 * 42"
 * formatString("?id={id}&q={query}", { id: 1, query: "answer" }) === "?id=1&q=answer"
 */
export function formatString(
  template: string,
  formatArgs: any[] | Record<PropertyKey, any>
): string {
  // Finds all "{}" pairs with some text between.
  const matches = template.matchAll(/(\\?)\{(.+?)\}/g);
  let result = "";
  let lastEnd = 0;

  for (const m of matches) {
    // If the "{}" pair has a preceding "\\", it is treated like a raw pair
    // of "{}".
    // e.g. `t("\\{some text}")` === `"{some text}"`
    if (m[1]) {
      result += m[0].slice(1);
    }
    // If the "{}" pair does not have a preceding "\\", it is replaced by
    // the corresponding value in `formatArgs`.
    // e.g. `t("{some text}")` === `formatArgs["some text"]`
    else {
      result += template.slice(lastEnd, m.index) + formatArgs[m[2] as any];
    }
    lastEnd = m.index + m.length + 1;
  }

  return result;
}
