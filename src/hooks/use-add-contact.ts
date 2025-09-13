import { addCandidate } from '@/apis/contact'

const useAddContact = async (userInfo, targetId, globalSocket, toast) => {
  try {
    const _targetId = targetId.value
    await addCandidate(_targetId)
    toast.add({ title: '已向对方发送好友申请', icon: 'lucide:smile' })
    const { id, nickname, region, birthday, gender } = userInfo.value
    const notification = {
      id,
      content: '请求添加你为好友',
      type: 'add-contact',
      createdAt: Date.now(),
      profile: {
        nickname,
        region,
        birthday,
        gender
      }
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
