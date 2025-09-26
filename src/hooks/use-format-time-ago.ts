const minute = 60 * 1000
const hour = 60 * minute
const day = 24 * hour
const week = 7 * day

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
          : new Date(timestamp).toLocaleString('zh-CN', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })
}

export default useFormatTimeAgo
