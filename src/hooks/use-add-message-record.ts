import useScrollToBottom from './use-scroll-to-bottom'

const minute = 60 * 1000
const fiveMins = 5 * minute

const addMessageToDB = async (db, message) => await db.add('messages', message)

const overFiveMins = (timestamp, lastMsgTimeStamp) =>
  timestamp - lastMsgTimeStamp.value > fiveMins

const addMessageLabelToDB = async (
  db,
  timestamp: number,
  lastMsgTimeStamp,
  remoteRoomInfo
) => {
  const hasLabel = overFiveMins(timestamp, lastMsgTimeStamp)

  if (hasLabel) {
    await addMessageToDB(db, {
      roomId: remoteRoomInfo.value.roomId,
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
  lastMsgTimeStamp,
  messageList,
  remoteRoomInfo
) => {
  const hasLabel = await addMessageLabelToDB(
    db,
    messageRecord.timestamp,
    lastMsgTimeStamp,
    remoteRoomInfo
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
    roomId: remoteRoomInfo.value.roomId,
    ...messageRecord
  })
}

const addMessageLabelToView = (
  messageRecord,
  messageList,
  lastMsgTimeStamp,
  remoteRoomInfo
) => {
  const { timestamp } = messageRecord

  if (overFiveMins(timestamp, lastMsgTimeStamp)) {
    messageList.value.push({
      roomId: remoteRoomInfo.value.roomId,
      type: 'label',
      timestamp
    })
  }

  lastMsgTimeStamp.value = timestamp
}

const addMessageToView = (messageRecord, messageList, msgStamp, modalRef) => {
  const _messageList = messageList.value
  const { content } = messageRecord

  // content.length > 1 说明不是 message 或 label
  // content[0] !== null 说明是接收方
  if (content.length > 1 && content[0] !== null) {
    messageRecord.content[0] = URL.createObjectURL(
      messageRecord.content[0] as Blob
    )
  }

  _messageList.push(messageRecord)
  msgStamp.value.value = ''
  useScrollToBottom(modalRef)
}

const addMessagesToView = (
  modalRef,
  messageRecord,
  messageList,
  msgStamp,
  lastMsgTimeStamp,
  remoteRoomInfo
) => {
  addMessageLabelToView(
    messageRecord,
    messageList,
    lastMsgTimeStamp,
    remoteRoomInfo
  )
  addMessageToView(messageRecord, messageList, msgStamp, modalRef)
}

const useAddMessageRecord = async (
  db,
  modalRef,
  messageRecord,
  messageList,
  msgStamp,
  lastMsgTimeStamp,
  remoteRoomInfo
) => {
  // 本地记录中会将 blob 转为 url，因为必须先保存记录进数据库
  await addMessagesToDB(
    db,
    messageRecord,
    lastMsgTimeStamp,
    messageList,
    remoteRoomInfo
  )
  addMessagesToView(
    modalRef,
    messageRecord,
    messageList,
    msgStamp,
    lastMsgTimeStamp,
    remoteRoomInfo
  )
}

export default useAddMessageRecord
