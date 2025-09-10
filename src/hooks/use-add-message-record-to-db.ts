import useGetDB from './use-get-db'

const useAddMessageRecordToDB = async (
  isOverFiveMins,
  messageRecord,
  _lastMsgMap
) => {
  const { contact: targetId, timestamp, sent } = messageRecord
  const db = await useGetDB()

  if (isOverFiveMins) {
    // 如果间隔超过 5 分钟，需要添加 label
    await db.add('messages', {
      contact: targetId,
      type: 'label',
      timestamp
    })
    // 有标签的情况下，说明存在时间间隔，就算发送消息的是同一人也需要添加分隔器
    messageRecord.separator = true
  } else if (sent !== _lastMsgMap[targetId].sent) {
    // 不是连续的消息，这条消息添加分隔器（添加 margin-top 样式）
    messageRecord.separator = true
  }

  return db.add('messages', messageRecord)
}

export default useAddMessageRecordToDB
