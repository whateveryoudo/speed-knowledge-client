
export function isObjectLike(str: string) {
  // 移除所有字符串内容（避免引号内的 {} 干扰）
  const cleanStr = str.replace(/(".*?"|'.*?'|`.*?`)/g, '');

  // 检查是否以 { 开头，以 } 结尾，并且 {} 成对出现
  return (
    cleanStr.trim().startsWith('{') &&
    cleanStr.trim().endsWith('}') &&
    (cleanStr.match(/{/g) || []).length === (cleanStr.match(/}/g) || []).length
  );
}