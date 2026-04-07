import type { MessageItem, ChatMessageBase } from "../composables/types";

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
// 获取子消息
export const getSubMessageItem = (item: MessageItem): Partial<ChatMessageBase> | null => {

  if (item?.subMessages.length > 0) {
    return item.subMessages.find((subMessage: Partial<ChatMessageBase>) => subMessage.version === item.currentVersion) ?? null;
  }
  return null;
}
//  兼容获取组当前消息内容
export function getMessage(item: MessageItem) {
  const subMessage = getSubMessageItem(item);
  return subMessage?.content ?? '';
}
// 获取指定属性值
export function getAttrFormSubMessage(item: MessageItem, attr: keyof Partial<ChatMessageBase>) {
  if (getSubMessageItem(item)) {
    return getSubMessageItem(item)?.[attr] ?? '';
  }
  return null;
}