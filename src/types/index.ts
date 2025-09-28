interface BaseResponse<T = any> {
  code: number
  data: T
  message?: string
}

declare module 'axios' {
  interface AxiosResponse<T = any> extends BaseResponse<T> {}
}

export type userInfo = {
  id: string
  email: string
  tokenVersion: number
  profile: {
    nickname: string
    gender: 'male' | 'female' | 'other'
    birthday: string
    region: string
    bio: string
    role: 'standard'
  }
}

export type message = {
  id?: string | number
  type: 'text' | 'label' | 'image' | 'audio'
  hash?: string
  url?: string
  duration?: number
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
  error?: boolean
  resendArgs?: any[]
}

export type post = {
  _id: string
  user: string
  commentCount: number
  comments: []
  content: {
    text?: string
    media: string[]
  }
  createdAt: number
  updateAt?: number
  likes: number
  liked: boolean
  unlikes: number
}

export type comment = {
  owner?: string
  user: string
  content: {
    text?: string
    media?: string[]
  }
  createdAt: number
  updateAt?: number
  likes: number
  liked: boolean
  profile: userInfo['profile']
  replyTargetProfile?: { nickname: string }
  replyCount: number
  visibleReplyCount: number
  page: number
  _id: string
  replyComments: (Omit<comment, 'replyCount' | 'replyComments'> & {
    parentId: string
  })[]
}
