import useFormatTimeAgo from './use-format-time-ago'
import useGetDB from './use-get-db'

const useUpdateLastMsg = async (
  id,
  indexMap,
  lastMsgList,
  _lastMsgMap,
  messageRecord,
  isReceive,
  inView,
  unreadMsgCounter,
  isOfflineMsg = false,
  offlineMsgLength = 0
) => {
  const db = await useGetDB(id)
  const { contact: targetId, timestamp, content, sent } = messageRecord
  const item = _lastMsgMap[targetId]

  item.sent = sent
  item.content = content
  item.timestamp = timestamp
  item.timeAgo = useFormatTimeAgo(timestamp)

  const _lastMsgList = lastMsgList.value
  const _indexMap = indexMap.value

  if (!item.pin) {
    if (_indexMap[targetId] === undefined) {
      // 列表中的新对象，由于先添加视图，因此它在 lastMsgList 中的索引是 0
      for (let i = 1; i < _lastMsgList.length; i++) {
        // 每一项的索引进行自增
        _indexMap[_lastMsgList[i]]++
      }

      _indexMap[targetId] = 0
    } else {
      // 列表中已经存在的对象
      const oldIndex = _indexMap[targetId]

      // 如果它正好的列表的首项，什么也不用做
      if (oldIndex !== 0) {
        // 如果不是，它之前的项的索引进行自增
        for (let i = 0; i < oldIndex; i++) {
          _indexMap[_lastMsgList[i]]++
        }
        // 将它移至首项
        _lastMsgList.splice(oldIndex, 1)
        _lastMsgList.unshift(targetId)
        _indexMap[targetId] = 0
      }
    }
  }

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
