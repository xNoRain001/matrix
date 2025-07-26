import { useUserInfoStore } from '@/store'
import HTTP from './http'

const setLatestRoom = async (path, roomId: string, latestId?: string) =>
  HTTP.request(
    `/set-latest-room?id=${useUserInfoStore().userInfo.id}&path=${path}&roomId=${roomId}${latestId ? `&latestId=${latestId}` : ''}`
  )

export default setLatestRoom
