const useAddMessageRecordToView = (label, messageRecord, messageList) => {
  const _messageList = messageList.value

  if (label) {
    _messageList.push(label)
  }

  _messageList.push(messageRecord)
}

export default useAddMessageRecordToView
