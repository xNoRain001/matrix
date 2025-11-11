import { day, week } from '@/const'

const useFormatTimestamp = (timestamp: number) => {
  const diff = Date.now() - timestamp

  return new Date(timestamp).toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    ...(diff > day && diff < week && { weekday: 'long' }),
    ...(diff > week && { year: 'numeric', month: 'long', day: 'numeric' })
  })
}

export default useFormatTimestamp
