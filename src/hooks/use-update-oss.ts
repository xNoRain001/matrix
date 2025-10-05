import { updateAvatar, updateSpaceBg } from '@/apis/oss'
import useGenHash from './use-gen-hash'
import useGetDB from './use-get-db'

const useUpdateOSS = async (e, type, userInfo, toast, urlRef) => {
  const input = e.target
  const file = input.files[0]

  if (file.size > 10 * 1024 * 1024) {
    throw Error('发送失败，图片大小不能超过 10MB')
  }

  try {
    const hash = await useGenHash(file)
    type === 'avatar'
      ? await updateAvatar(file, hash)
      : await updateSpaceBg(file, hash)
    const db = await useGetDB(userInfo.value.id)
    await db.put(type, { id: userInfo.value.id, blob: file })
    urlRef.value = URL.createObjectURL(file)
    toast.add({ title: '更新成功', icon: 'lucide:smile' })
  } catch {
    toast.add({
      title: '更新失败',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  } finally {
    input.value = ''
  }
}

export default useUpdateOSS
