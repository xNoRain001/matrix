import useGetDB from './use-get-db'

const clearMessageRecord = async (
  userInfo,
  targetId,
  messageRecordMap,
  activeTargetIds,
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

  // 删除列表时，会关闭聊天界面，聊天界面销毁时会删除内存中的聊天记录和
  // activeTargetId，因此下面的代码不会被执行
  if (activeTargetIds.value.has(targetId)) {
    messageRecordMap.value[targetId].messages = []
  }
}

const useClearMessageRecord = async (
  userInfo,
  targetId,
  messageRecordMap,
  lastMsgMap,
  activeTargetIds,
  pure = true // 值为 false 说明在执行前已经删除了聊天列表，不需要再处理 lastMessages
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
    messageRecordMap,
    activeTargetIds,
    item,
    pure
  )
}

export default useClearMessageRecord
