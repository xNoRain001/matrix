interface BaseResponse<T = any> {
  code: number
  data: T
  message?: string
}

declare module 'axios' {
  interface AxiosResponse<T = any> extends BaseResponse<T> {}
}

export type userInfo = {
  nickname: string
  gender: 'male' | 'female' | 'other'
  birthday: string
  region: string
  id: string
  tokenVersion: number
}

export type lastMsg = {
  id: string
  profile: Omit<userInfo, 'tokenVersion' | 'id'>
  timestamp: number
  content: string
  sent: boolean
  unreadMsgs: number
  timeAgo: string
}

export type lastMsgMap = Record<string, lastMsg>

export type message = {
  id?: number
  type: 'text' | 'label' | 'image'
  hash?: string
  url?: string
  ossURL?: string
  width?: number
  height?: number
  content?: string
  sent?: boolean
  sender: string
  receiver: string
  contact: string
  timestamp: number
  separator?: boolean
}

export type user = {
  id: string
  nickname: string
  remark: string
  status: 'normal' | 'blocked' | 'deleted'
}

export type users = user[]
