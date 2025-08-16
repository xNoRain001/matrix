import type { Socket } from 'socket.io-client'
import type { Ref } from 'vue'
import type { receivedFiles } from '@/types'

let receivedSize = 0
const receivedBuffer: ArrayBuffer[] = []

const useReceiveFile = (
  socket: Socket,
  data: ArrayBuffer,
  inReceving: Ref<boolean>,
  receivedFiles: receivedFiles,
  receivedLabel: '接收完成...',
  roomId: string,
  receiveStartTime: Ref<number>
) => {
  inReceving.value = true
  const { byteLength } = data
  // 当前接收的文件
  const _receivedFiles = receivedFiles.value
  const receivedFile = _receivedFiles[_receivedFiles.length - 1]
  const { name, size, type, messageType } = receivedFile
  receivedBuffer.push(data)
  receivedSize += byteLength
  // const time = Date.now() - lastReceiveTime
  // lastReceiveTime = Date.now()
  receivedFile.progress = Number(((receivedSize / size) * 100).toFixed(2))
  // receivedFile.speed = `${(byteLength / 1024 / 1024 / (time / 1000)).toFixed(2)} MB/s`

  // 所有数据传输完成
  if (receivedSize === size) {
    const timestamp = Date.now()
    receivedFile.time =
      ((timestamp - receiveStartTime.value) / 1000).toFixed(2) + ' s'
    // 深拷贝，否则下载时会被回收
    // { type: 'video/mp4' } 用于兼容 safari，safari 中 video 的链接如果是 blob，
    // 必须是 MP4 格式
    const blob = new Blob([...receivedBuffer], { type: 'video/mp4' })
    receivedFile.blob = blob
    receivedFile.status = receivedLabel
    receivedBuffer.length = 0
    receivedSize = 0
    inReceving.value = false
    socket.emit('saved-file', roomId, null)

    return {
      blob,
      name,
      size,
      type,
      timestamp,
      messageType
    }
  }
}

export default useReceiveFile
