import useFormatTimeAgo from './use-format-time-ago'
import useGetDB from './use-get-db'

const useUpdateLastMsg = async (
  _lastMsgMap,
  messageRecord,
  isReceive,
  inView,
  unreadMsgCounter,
  isOfflineMsg = false,
  offlineMsgLength = 0
) => {
  const db = await useGetDB()
  const { contact: targetId, timestamp, content, sent } = messageRecord
  const item = _lastMsgMap[targetId]

  item.sent = sent
  item.content = content
  item.timestamp = timestamp
  item.timeAgo = useFormatTimeAgo(timestamp)

  if (isReceive) {
    item.unreadMsgs = item.unreadMsgs || 0

    if (!inView) {
      if (isOfflineMsg) {
        item.unreadMsgs += offlineMsgLength
        unreadMsgCounter.value += offlineMsgLength
      } else {
        item.unreadMsgs++
        unreadMsgCounter.value++
      }
    }
  }

  await db.put('lastMessages', JSON.parse(JSON.stringify(item)))
}

export default useUpdateLastMsg
