import useGetDB from './use-get-db'

const clearMessageRecord = async (
  userInfo,
  targetId,
  messageList,
  _targetId,
  lastFetchedId,
  item,
  pure
) => {
  const db = await useGetDB(userInfo.value.id)

  if (pure) {
    await db.put('lastMessages', JSON.parse(JSON.stringify(item)))
  }

  const transaction = db.transaction('messages', 'readwrite')
  const store = transaction.objectStore('messages')
  const index = store.index('contact_id')
  let cursor = await index.openCursor(
    IDBKeyRange.bound([targetId, 0], [targetId, Infinity], false, true),
    'prev'
  )

  if (!cursor) {
    return
  }

  while (cursor) {
    await cursor.delete()
    cursor = await cursor.continue()
  }

  // TODO: 删除列表时，先删除列表，聊天界面销毁时会清空内存中的聊天记录，这里不需要再
  // 次清空
  if (_targetId.value === targetId) {
    messageList.value = []
    lastFetchedId.value = Infinity
  }
}

const useClearMessageRecord = async (
  userInfo,
  targetId,
  messageList,
  lastMsgMap,
  _targetId,
  lastFetchedId,
  pure = true // 值为 false 说明在执行前已经删除了聊天列表
) => {
  const item = pure ? lastMsgMap.value[targetId] : null

  if (pure) {
    item.content = ''
    item.timestamp = 0
    item.timeAgo = ''
  }

  await clearMessageRecord(
    userInfo,
    targetId,
    messageList,
    _targetId,
    lastFetchedId,
    item,
    pure
  )
}

export default useClearMessageRecord
