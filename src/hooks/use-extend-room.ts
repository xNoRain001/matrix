const onIsOnline = (online, v) => (online.value = v)

const onFull = (socket, isFull) => {
  isFull.value = true
  socket.disconnect()
}

const onAddContact = isContactModalOpen => {
  isContactModalOpen.value = true
}

const onRefuseAddContact = toast => {
  toast.add({
    title: '对方拒绝了你的好友请求',
    color: 'error'
  })
}

const onAgreeAddContact = toast => {
  toast.add({
    title: '添加好友成功',
    color: 'success'
  })
}

const useExtendRoom = (socket, online, isFull, isContactModalOpen, toast) => {
  const _socket = socket.value
  // 在房间里时需要额外处理满员和对方的在线状态
  _socket.on('full', () => onFull(_socket, isFull))
  _socket.on('is-online', v => onIsOnline(online, v))
  _socket.on('add-contact', () => onAddContact(isContactModalOpen))
  _socket.on('refuse-add-contact', () => onRefuseAddContact(toast))
  _socket.on('agree-add-contact', () => onAgreeAddContact(toast))
}

export default useExtendRoom
