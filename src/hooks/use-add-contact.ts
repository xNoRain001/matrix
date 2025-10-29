import { addCandidate } from '@/apis/contact'

const useAddContact = async (targetId, globalSocket, toast) => {
  try {
    await addCandidate(targetId)
    toast.add({ title: '已向对方发送好友申请', icon: 'lucide:smile' })
    globalSocket.value.emit('add-contact', targetId)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

export default useAddContact
