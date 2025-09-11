const useAddMessageRecordToView = (
  isOverFiveMins,
  messageRecord,
  messageList,
  labelId,
  msgId
) => {
  const { timestamp } = messageRecord
  const _messageList = messageList.value

  if (isOverFiveMins) {
    _messageList.push({
      type: 'label',
      timestamp,
      id: labelId
    })
  }

  messageRecord.id = msgId
  _messageList.push(messageRecord)
}

export default useAddMessageRecordToView
