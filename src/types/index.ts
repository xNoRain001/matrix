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
    ocGender: string
    age: string
    gender: 'male' | 'female' | 'other'
    birthday: string
    province: string
    city: string
    bio: string
    college: string
    role: 'standard'
    mbti:
      | 'ISTJ'
      | 'ISFJ'
      | 'INFJ'
      | 'INTJ'
      | 'ISTP'
      | 'ISFP'
      | 'INFP'
      | 'INTP'
      | 'ESTP'
      | 'ESFP'
      | 'ENFP'
      | 'ENTP'
      | 'ESTJ'
      | 'ESFJ'
      | 'ENFJ'
      | 'ENTJ'
    tags: string[]
    createdAt: number
    onlineStatus?: {
      isOnline: boolean
      lastOnline: number
    }
  }
  ipInfo: {
    province: string
    city: string
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

export type content = {
  text?: string
  images: {
    url: string
    ossURL: string
    width: number
    height: number
    blob?: Blob
  }[]
}

export type post = {
  id?: number
  _id: string
  user: string
  commentCount: number
  comments: comment[]
  content: content
  createdAt: number
  updateAt?: number
  likes: number
  liked: boolean
  unlikes: number
  profile?: userInfo['profile']
  visibility: 'public' | 'onlyMe' | 'hidden'
}

export type comment = {
  owner?: string
  user: string
  content: content
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
  hot?: number
  replyComments: (Omit<comment, 'replyCount' | 'replyComments'> & {
    parentId: string
  })[]
}
