import { likeAPI } from '@/apis/like'

const useLike = async (
  toast,
  container,
  targetId,
  targetType: 'post' | 'comment'
) => {
  try {
    const { data: isLike } = await likeAPI(targetId, targetType)

    if (isLike) {
      container.liked = true
      container.likes++
    } else {
      container.liked = false
      container.likes--
    }
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

export default useLike
