import { deleteContact } from '@/apis/contact'

const useDeleteContact = async (
  userInfo,
  targetId,
  contactList,
  contactProfileMap,
  globalSocket,
  toast,
  activeSpaceTargetIds,
  isSpaceOpen
) => {
  try {
    await deleteContact(targetId)
    toast.add({ title: '删除好友成功', icon: 'lucide:smile' })
    const { id } = userInfo.value
    const _contactList = contactList.value
    const _contactProfileMap = contactProfileMap.value
    const index = _contactList.findIndex(id => id === targetId)

    if (index >= 0) {
      _contactList.splice(index, 1)
      delete _contactProfileMap[targetId]
      localStorage.setItem(`contactList-${id}`, JSON.stringify(_contactList))
      localStorage.setItem(
        `contactProfileMap-${id}`,
        JSON.stringify(_contactProfileMap)
      )
    }
    globalSocket.value.emit('delete-contact', targetId)

    if (activeSpaceTargetIds.value.has(targetId)) {
      isSpaceOpen.value = false
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
