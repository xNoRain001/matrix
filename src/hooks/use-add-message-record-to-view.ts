const useAddMessageRecordToView = (
  isOverFiveMins,
  messageRecord,
  messageList
) => {
  const { timestamp } = messageRecord
  const _messageList = messageList.value

  if (isOverFiveMins) {
    _messageList.push({
      type: 'label',
      timestamp
    })
  }

  _messageList.push(messageRecord)
}

export default useAddMessageRecordToView
