import type { Ref, Reactive } from 'vue'

export type receivedFiles = Ref<
  {
    name: string
    size: number
    type: string
    formatSize: string
    // speed: string
    progress: number
    status: '接收中...' | '接收完成...'
    blob: Blob
    time: string
    messageType?: fileTypes
  }[]
>

export type fileTypes = 'image' | 'video' | 'file' | 'audio'

export type sendStatus = '等待中...' | '传送中...' | '传送完成...'

export type sendFileStatus = Reactive<{
  // speed:string,
  status: sendStatus
  progress: number
  formatedProgress: string
  time: string
}>

export type extendedFile = File & { fileStatus: sendFileStatus }

export type extendedFiles = extendedFile[]

interface BaseResponse<T = any> {
  code: number
  data: T
  message?: string
}

declare module 'axios' {
  interface AxiosResponse<T = any> extends BaseResponse<T> {}
}

type commonUserInfo = {
  nickname: string
  avatar: string
  gender: 'male' | 'female' | 'other'
  birthday: string
  region: string
  id: string
}

export type userInfo = commonUserInfo & {
  email: string
}

export type otherInfo = commonUserInfo

export type remoteRoomInfo = {
  path: string
  roomId: string
  latestId: string
  inRoom: boolean
  showExitRoomTip: boolean
}

type commonMessage = {
  roomId?: string
  type: 'message' | 'label' | fileTypes
  sent?: boolean
  timestamp: number
  separator?: boolean
}

export type message = commonMessage & {
  showProgress?: boolean // 控制是否显示发送文件时的进度
  content?:
    | [string]
    | [string, string, number, string] // url 文件名 大小 文件类型
    | [string, string, number, string] // url 文件名 大小 文件类型
}

export type dbMessage = commonMessage & {
  content?:
    | [string]
    | [File, string, number, string] // File 文件名 大小 文件类型
    | [Blob, string, number, string] // Blob 文件名 大小 文件类型
    | [null, string, number, string] // 发送方不保存发送的文件到本地数据库中
}
