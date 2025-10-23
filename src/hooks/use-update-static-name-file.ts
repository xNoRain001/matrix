import { getSignedURLAPI, updateStaticNameAPI } from '@/apis/oss'
import useGenHash from './use-gen-hash'
import useGetDB from './use-get-db'
import useNSFW from './use-nsfw'

const useUpdateStaticNameFile = async (
  e,
  type: 'avatar' | 'spaceBg',
  userInfo,
  toast,
  urlRef
) => {
  const input = e.target
  const file = input.files[0]

  if (file.size > 10 * 1024 * 1024) {
    toast.add({
      title: '上传失败，图片大小不能超过 10MB',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    input.value = ''
    return
  }

  try {
    await useNSFW([file])
  } catch {
    toast.add({
      title: '操作失败，图片违规',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    input.value = ''
    return
  }

  try {
    const hash = await useGenHash(file)
    const { data: signedURL } = await getSignedURLAPI('tmp', hash, file.size)
    const ossURL = `tmp/${userInfo.value.id}/${hash}`

    // 临时目录中不存在该图片
    if (signedURL !== ossURL) {
      const { ok } = await fetch(signedURL, {
        method: 'PUT',
        body: file
      })

      if (!ok) {
        throw Error('上传图片失败')
      }
    }

    try {
      await updateStaticNameAPI(type, hash)
      const db = await useGetDB(userInfo.value.id)
      await db.put(type, { id: userInfo.value.id, blob: file })
      urlRef.value = URL.createObjectURL(file)
      toast.add({ title: '更新成功', icon: 'lucide:smile' })
    } catch (error) {
      throw error
    }
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  } finally {
    input.value = ''
  }
}

export default useUpdateStaticNameFile
