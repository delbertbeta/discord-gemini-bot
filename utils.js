/**
 * 
 * @param {string} str 
 * @param {Map<string, User>} obj 
 * @returns 
 */
exports.replaceWithObjectValues = function replaceWithObjectValues(str, obj) {
  // 正则表达式：匹配以@开头，后面跟着一串数字
  const regex = /@(\d+)/g;

  return str.replace(regex, (match, p1) => {
    // p1 捕获组，包含匹配到的数字
    return `@${obj.get(p1)?.displayName ?? p1}`; // 如果对象中没有对应值，则返回原来的数字
  });
}
