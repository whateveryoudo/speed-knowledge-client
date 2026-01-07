import dayjs from "dayjs";
export const transformDatatimeToRecentText = (datetime: Date | string) => {
  const diffMinutes = dayjs().diff(dayjs(datetime), "minutes");
  const diffDays = dayjs().diff(dayjs(datetime), "days");
  // 如果时间大于2天，则显示具体时间
  if (diffDays > 2) {
    return dayjs(datetime).format("YYYY-MM-DD HH:mm:ss");
  } else {
    // 如果小于1小时，则显示为xx分钟前
    if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    } else {
      const dayText = diffDays > 1 ? "昨天" : "今天";
      return `${dayText} ${dayjs(datetime).format("HH:mm")}`;
    }
  }
};
