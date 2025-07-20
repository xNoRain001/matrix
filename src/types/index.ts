import type { Ref } from 'vue'

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
    messageType?: 'image' | 'video' | 'file'
  }[]
>
