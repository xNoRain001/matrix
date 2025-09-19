const useAddMessageRecordToView = (
  inView,
  label,
  messageRecord,
  messageList,
  msgContainerRef
) => {
  if (!inView) {
    return
  }

  const _messageList = messageList.value

  if (label) {
    _messageList.push(label)
  }

  _messageList.push(messageRecord)
  ;(msgContainerRef.value as any).scrollToBottom()
}

export default useAddMessageRecordToView
