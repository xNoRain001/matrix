import { day, hour, minute, week } from '@/const'
import useFormatTimestamp from './use-format-timestamp'

const useFormatTimeAgo = timestamp => {
  const diff = Date.now() - timestamp

  return diff < minute
    ? '刚刚'
    : diff < hour
      ? `${Math.floor(diff / minute)} 分钟前`
      : diff < day
        ? `${Math.floor(diff / hour)} 小时前`
        : diff < week
          ? `${Math.floor(diff / day)} 天前`
          : useFormatTimestamp(timestamp)
}

export default useFormatTimeAgo
