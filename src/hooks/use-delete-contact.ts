import { deleteCandidate } from '@/apis/contact'

const useDeleteContact = async (
  userInfo,
  targetId,
  contactList,
  contactProfileMap,
  globalSocket,
  toast,
  _targetId
) => {
  try {
    await deleteCandidate(targetId)
    toast.add({ title: '删除好友成功', icon: 'lucide:smile' })
    const { id, nickname } = userInfo.value
    const notification = {
      id,
      content: '将你从好友列表中移除了',
      createdAt: Date.now(),
      profile: {
        nickname
      }
    }
    const _contactList = contactList.value
    const _contactProfileMap = contactProfileMap.value
    const index = _contactList.findIndex(item => item.id === targetId)

    if (index >= 0) {
      _contactList.splice(index, 1)
      delete _contactProfileMap[targetId]
      localStorage.setItem(`contactList-${id}`, JSON.stringify(_contactList))
      localStorage.setItem(
        `contactProfileMap-${id}`,
        JSON.stringify(_contactProfileMap)
      )
    }
    globalSocket.value.emit('delete-contact', targetId, notification)

    if (targetId === _targetId.value) {
      _targetId.value = ''
    }
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

export default useDeleteContact
