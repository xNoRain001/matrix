import { getSignedURLAPI } from '@/apis/oss'
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
    // hash 用于生成预签名前检查文件类型是否满足要求
    const hash = await useGenHash(file)
    const { data: signedURL } = await getSignedURLAPI(type, hash, file.size)
    // 由于是固定名称，不进行 hash 比较，如果上传相同的图片也直接进行覆盖
    const { ok } = await fetch(signedURL, {
      method: 'PUT',
      body: file
    })

    if (ok) {
      const db = await useGetDB(userInfo.value.id)
      await db.put(type, { id: userInfo.value.id, blob: file })
      urlRef.value = URL.createObjectURL(file)
      toast.add({ title: '更新成功', icon: 'lucide:smile' })
    } else {
      throw Error()
    }
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

export default useUpdateStaticNameFile
