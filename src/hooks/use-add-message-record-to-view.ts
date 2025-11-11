const useAddMessageRecordToView = (
  inView,
  label,
  messageRecord,
  messageRecordMap,
  id
) => {
  if (!inView) {
    return
  }

  const { messages, scroller } = messageRecordMap.value[id]

  if (label) {
    messages.push(label)
  }

  messages.push(messageRecord)
  scroller.scrollToBottom()
}

export default useAddMessageRecordToView
