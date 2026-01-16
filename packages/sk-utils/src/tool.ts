import dayjs from "dayjs";
export const transformDatatimeToRecentText = (datetime: Date | string) => {
  const diffMinutes = dayjs().diff(dayjs(datetime), "minutes");
  const now = dayjs();
  const target = dayjs(datetime);
  const isToday = now.isSame(target, "day");
  const isYesterday = now.subtract(1, "day").isSame(target, "day");
  
  if (!isToday && !isYesterday) {
    return target.format("YYYY-MM-DD HH:mm:ss");
  }
  if (isToday) {
    if (diffMinutes < 60) {
      return diffMinutes < 1 ? "刚刚" : `${diffMinutes}分钟前`;
    }
    return '今天'
  }
  if (isYesterday) {
    return "昨天";
  }
};
