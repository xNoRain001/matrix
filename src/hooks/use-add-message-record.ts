import useGetDB from './use-get-db'
// import useScrollToBottom from './use-scroll-to-bottom'

const minute = 60 * 1000
const fiveMins = 5 * minute

const addMessageToDB = async (db, message) => await db.add('messages', message)

const overFiveMins = (timestamp, lastMsgInfo) =>
  timestamp - lastMsgInfo.value.timestamp > fiveMins

const addMessageLabelToDB = async (
  db,
  timestamp: number,
  lastMsgInfo,
  targetId
) => {
  const hasLabel = overFiveMins(timestamp, lastMsgInfo)

  if (hasLabel) {
    await addMessageToDB(db, {
      contact: targetId,
      type: 'label',
      timestamp
    })
  }

  return hasLabel

  // 不在这里更新 lastMsgTimeStamp，因为此时视图中还没添加 message label
}

const addMessagesToDB = async (
  db,
  messageRecord,
  lastMsgInfo,
  messageList,
  targetId
) => {
  const hasLabel = await addMessageLabelToDB(
    db,
    messageRecord.timestamp,
    lastMsgInfo,
    targetId
  )

  if (hasLabel) {
    // 有标签的情况下，说明存在时间间隔，就算发送消息的是同一人也需要添加分隔器
    messageRecord.separator = true
  } else {
    const _messageList = messageList.value

    // 不是连续的消息，这条消息添加分隔器（添加 margin-top 样式）
    if (messageRecord.sent !== _messageList[_messageList.length - 1]?.sent) {
      messageRecord.separator = true
    }
  }

  await addMessageToDB(db, {
    targetId,
    ...messageRecord
  })
}

const addMessageLabelToView = (
  messageRecord,
  messageList,
  lastMsgInfo,
  targetId
) => {
  const { timestamp } = messageRecord

  if (overFiveMins(timestamp, lastMsgInfo)) {
    messageList.value.push({
      targetId,
      type: 'label',
      timestamp
    })
  }
}

const addMessageToView = (messageRecord, messageList, lastMsgInfo) => {
  const _messageList = messageList.value
  // const { content } = messageRecord

  // content.length > 1 说明不是 message 或 label
  // content[0] !== null 说明是接收方
  // if (content.length > 1 && content[0] !== null) {
  //   messageRecord.content[0] = URL.createObjectURL(
  //     messageRecord.content[0] as Blob
  //   )
  // }

  _messageList.push(messageRecord)
  lastMsgInfo.value.timestamp = messageRecord.timestamp
  lastMsgInfo.value.value = ''
}

const addMessagesToView = (
  messageRecord,
  messageList,
  lastMsgInfo,
  targetId
) => {
  addMessageLabelToView(messageRecord, messageList, lastMsgInfo, targetId)
  addMessageToView(messageRecord, messageList, lastMsgInfo)
}

const useAddMessageRecord = async (
  messageRecord,
  messageList,
  lastMsgInfo,
  targetId
) => {
  const db = await useGetDB()
  // 本地记录中会将 blob 转为 url，因为必须先保存记录进数据库
  await addMessagesToDB(db, messageRecord, lastMsgInfo, messageList, targetId)
  addMessagesToView(messageRecord, messageList, lastMsgInfo, targetId)
}

export default useAddMessageRecord
