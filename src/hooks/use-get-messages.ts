import useGetDB from './use-get-db'

let db = null

// 获取所有聊天记录
const getMessages = async remoteRoomInfo => {
  if (!db) {
    db = await useGetDB()
  }

  const data = await db.getAllFromIndex(
    'messages',
    'roomId',
    remoteRoomInfo.value.roomId
  )
  data.forEach(({ type, content, sent }) => {
    if (
      type === 'image' ||
      type === 'video' ||
      (type === 'file' && !sent) ||
      type === 'audio'
    ) {
      content[0] = URL.createObjectURL(content[0])
    }
  })

  return data
}

const useGetMessages = async (
  messageList,
  lastMsgTimeStamp,
  remoteRoomInfo
) => {
  // 如果处理消息失败，给空消息
  try {
    const messages = await getMessages(remoteRoomInfo)
    messageList.value = [...messages]
    lastMsgTimeStamp.value = messages[messages.length - 1]?.timestamp || 0
  } catch {
    messageList.value = []
    lastMsgTimeStamp.value = 0
  }

  return db
}

export default useGetMessages
