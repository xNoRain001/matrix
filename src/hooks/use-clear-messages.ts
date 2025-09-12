import useGetDB from './use-get-db'

const useClearMessages = async id => {
  // const db = await useGetDB()
  // const tx = db.transaction('messages', 'readwrite')
  // const store = tx.objectStore('messages')
  // const index = store.index('roomId')
  // // 通过索引直接获取对应roomId的消息
  // const messages = await index.getAll(roomId)
  // await Promise.all(messages.map(msg => store.delete(msg.id)))
  // await tx.done
}

export default useClearMessages
