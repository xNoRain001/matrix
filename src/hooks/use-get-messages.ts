import useGetDB from './use-get-db'

let db = null

// 获取所有聊天记录
const getMessages = async targetId => {
  if (!db) {
    db = await useGetDB()
  }

  const data = await db.getAllFromIndex('messages', 'contact', targetId)
  // data.forEach(({ type, content, sent }) => {
  //   if (
  //     type === 'image' ||
  //     type === 'video' ||
  //     (type === 'file' && !sent) ||
  //     type === 'audio'
  //   ) {
  //     content[0] = URL.createObjectURL(content[0])
  //   }
  // })

  return data.slice(-10)
}

const useGetMessages = async (messageList, lastMsgInfo, targetId) => {
  // 如果处理消息失败，给空消息
  try {
    const messages = await getMessages(targetId)
    messageList.value = [...messages]
    lastMsgInfo.value.timestamp = messages[messages.length - 1]?.timestamp || 0
  } catch {
    messageList.value = []
    lastMsgInfo.value.timestamp = 0
  }
}

export default useGetMessages
