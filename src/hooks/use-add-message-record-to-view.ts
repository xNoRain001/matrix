const useAddMessageRecordToView = (
  inView,
  label,
  messageRecord,
  messageRecordMap,
  id,
  isReceive = false
) => {
  if (!inView) {
    return
  }

  const t = messageRecordMap.value[id]
  const { messages, scroller } = t

  if (label) {
    messages.push(label)
  }

  messages.push(messageRecord)

  if (isReceive) {
    const { clientHeight, scrollHeight, scrollTop } = scroller.$el

    if (scrollHeight - clientHeight - scrollTop < 10) {
      scroller.scrollToBottom()
    } else {
      t.newMessageCount = t.newMessageCount || 0
      t.newMessageCount++
    }
  } else {
    scroller.scrollToBottom()
  }
}

export default useAddMessageRecordToView
