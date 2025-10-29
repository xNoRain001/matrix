import { addCandidate } from '@/apis/contact'

const useAddContact = async (userInfo, targetId, globalSocket, toast) => {
  try {
    await addCandidate(targetId)
    toast.add({ title: '已向对方发送好友申请', icon: 'lucide:smile' })
    const { id, profile } = userInfo.value
    const notification = {
      id,
      content: '请求添加你为好友',
      type: 'contact',
      actionType: 'addContact',
      createdAt: Date.now(),
      profile
    }
    globalSocket.value.emit('add-contact', targetId, notification)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

export default useAddContact
