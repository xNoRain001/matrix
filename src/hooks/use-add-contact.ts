import { addCandidate } from '@/apis/contact'

const useAddContact = async (userInfo, targetId, globalSocket, toast) => {
  try {
    const _targetId = targetId.value
    await addCandidate(_targetId)
    toast.add({ title: '已向对方发送好友申请', icon: 'lucide:smile' })
    const { id } = userInfo.value
    const profile = JSON.parse(JSON.stringify(userInfo.value))
    delete profile.id
    delete profile.tokenVersion
    const notification = {
      id,
      content: '请求添加你为好友',
      type: 'add-contact',
      createdAt: Date.now(),
      profile
    }
    globalSocket.value.emit('add-contact', _targetId, notification)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

export default useAddContact
