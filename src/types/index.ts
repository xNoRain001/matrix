interface BaseResponse<T = any> {
  code: number
  data: T
  message?: string
}

declare module 'axios' {
  interface AxiosResponse<T = any> extends BaseResponse<T> {}
}

type mbti =
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

export type userInfo = {
  id: string
  email: string
  tokenVersion: number
  profile: {
    nickname: string
    ocGender: string
    ocAge: string
    ocHeight: string
    ocWeight: string
    ocMBTI: mbti
    ocTags: string[]
    bio: string
    gender: 'male' | 'female' | 'other'
    birthday: string
    height: string
    weight: string
    mbti: mbti
    tags: string[]
    college: string
    province: string
    city: string
    role: 'standard'
    registerIndex: number
    createdAt: number
    // 扩展属性，这些数据不保存在数据库中
    onlineStatus?: {
      isOnline: boolean
      lastOnline: number
    }
    isFollower?: boolean
    ipInfo: {
      province: string
      city: string
    }
    loginDates?: string[]
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
