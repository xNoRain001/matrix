import useFormatMsgs from './use-format-msgs'
import useGetDB from './use-get-db'

const getMessages = async (id, lastFetchedId, hashToBlobURLMap, targetId) => {
  const messages = []
  const _lastFetchedId = lastFetchedId.value
  const db = await useGetDB(id)
  const transaction = db.transaction('messages', 'readonly')
  const store = transaction.objectStore('messages')
  const index = store.index('contact_id')
  let cursor = await index.openCursor(
    IDBKeyRange.bound([targetId, 0], [targetId, _lastFetchedId], false, true),
    'prev'
  )

  // 已经获取了所有
  if (!cursor) {
    lastFetchedId.value = 0
    return messages
  }

  let counter = 0
  while (cursor && counter < 20) {
    messages.unshift(cursor.value)
    counter++
    cursor = await cursor.continue()
  }

  lastFetchedId.value = messages[0].id
  await useFormatMsgs(id, messages, hashToBlobURLMap)

  return messages
}

const useGetMessages = async (
  id,
  hashToBlobURLMap,
  messageList,
  lastFetchedId,
  targetId,
  unshift = false
) => {
  // 如果处理消息失败，给空消息
  try {
    const data = await getMessages(
      id,
      lastFetchedId,
      hashToBlobURLMap,
      targetId
    )

    if (unshift) {
      messageList.value.unshift(...data)
      return data.length
    } else {
      messageList.value = data
    }
  } catch {
    messageList.value = []
    lastFetchedId.value = 0
  }
}

export default useGetMessages
