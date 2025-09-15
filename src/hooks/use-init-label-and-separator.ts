import type { messageLabel } from '@/types'

const fiveMins = 5 * 1000 * 60

const useInitLabelAndSeparator = (messageRecord, _lastMsgMap, targetId) => {
  const { timestamp, sent } = messageRecord
  const isOverFiveMins =
    timestamp - (_lastMsgMap[targetId]?.timestamp || 0) > fiveMins
  const label: messageLabel = isOverFiveMins
    ? {
        contact: targetId,
        type: 'label',
        timestamp
      }
    : null

  // 存在时间间隔，就算发送消息的是同一人也需要添加分隔器
  // 不是连续的消息，这条消息添加分隔器
  if (isOverFiveMins || sent !== _lastMsgMap[targetId]?.sent) {
    messageRecord.separator = true
  }

  return label
}

export default useInitLabelAndSeparator
