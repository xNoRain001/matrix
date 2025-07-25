import type { Ref, Reactive } from 'vue'

export type receivedFiles = Ref<
  {
    name: string
    size: number
    type: string
    formatSize: string
    // speed: string
    progress: string
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

export type userInfo = {
  nickname: string
  avatar: string
  gender: 'male' | 'female' | 'other'
  birthday: string
  region: string
}
