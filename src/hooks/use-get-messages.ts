import useGetDB from './use-get-db'

// 获取所有聊天记录
const getMessages = async (hashToBlobURLMap, targetId) => {
  const db = await useGetDB()
  const data = (
    await db.getAllFromIndex('messages', 'contact', targetId)
  ).slice(-10)
  const tx = db.transaction('files', 'readonly')
  const _hashToBlobURLMap = hashToBlobURLMap.value

  for (let i = 0, l = data.length; i < l; i++) {
    const item = data[i]
    const { type, hash } = item

    if (type === 'image') {
      if (_hashToBlobURLMap.has(hash)) {
        item.url = _hashToBlobURLMap.get(hash)
        continue
      }

      try {
        const record = await tx.objectStore('files').get(hash)
        const url = URL.createObjectURL(record.blob)
        item.url = url
        if (_hashToBlobURLMap.size < 100) {
          _hashToBlobURLMap.set(hash, url)
        }
      } catch {}
    }
  }

  await tx.done

  return data
}

const useGetMessages = async (hashToBlobURLMap, messageList, targetId) => {
  // 如果处理消息失败，给空消息
  try {
    messageList.value = await getMessages(hashToBlobURLMap, targetId)
  } catch {
    messageList.value = []
  }
}

export default useGetMessages
