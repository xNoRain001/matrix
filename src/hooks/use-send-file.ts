import type { Ref, Reactive } from 'vue'
import type { Socket } from 'socket.io-client'

type fileStatus = Reactive<{
  // speed:string,
  status: '等待中...' | '传送中...' | '传送完成...'
  progress: string
  time: string
}>

let timer = null
let offset = 0
let sendStartTime = 0

const useSendFile = async (
  pc: RTCPeerConnection,
  socket: Socket,
  dataChannel: RTCDataChannel,
  roomId: string,
  file: File & { fileStatus: fileStatus },
  flag: Ref<boolean>,
  sendingLabel: '传送中...',
  sentLabel: '传送完成...',
  messageType?: 'image' | 'video' | 'file'
) => {
  sendStartTime = Date.now()
  const { fileStatus }: { fileStatus: fileStatus } = file
  fileStatus.status = sendingLabel
  const { name, size, type } = file

  // 向对方发送文件的信息
  socket.emit('file-metadata', roomId, {
    name,
    size,
    type,
    messageType
  })

  await new Promise(resolve => {
    timer = setInterval(() => {
      if (flag.value) {
        flag.value = false
        clearInterval(timer)
        resolve(null)
      }
    }, 1000)
  })

  // send() 方法发送数据时有大小限制，其上限是 maxMessageSize (256KB)
  const chunkSize = pc.sctp.maxMessageSize

  while (offset < size) {
    const buffer = await file.slice(offset, offset + chunkSize).arrayBuffer()

    // 默认最大缓冲区为 256KB，如果通过数据通道发送大于 256KB 的数据块，
    // 通常会引发 EMSGSIZE 错误，导致浏览器通道关闭。考虑到浏览器的兼容性，
    // 我们将缓存队列的水位线 bufferedAmount-LowThreshold 设置为 64KB
    if (dataChannel.bufferedAmount > 65535) {
      // 等待缓存队列降到阈值之下
      await new Promise(resolve => {
        dataChannel.onbufferedamountlow = () => {
          resolve(null)
        }
      })
    }

    // 继续发送
    dataChannel.send(buffer)
    offset += buffer.byteLength
    // const time = Date.now() - lastSendTime
    // lastSendTime = Date.now()
    // fileStatus.speed = `${(chunkSize / 1024 / (time / 1000)).toFixed(2)} MB/s`
    fileStatus.progress = `${((offset / size) * 100).toFixed(2)} %`
  }

  fileStatus.status = sentLabel
  // fileStatus.speed = ''
  fileStatus.progress = ''
  offset = 0
  fileStatus.time = ((Date.now() - sendStartTime) / 1000).toFixed(2) + ' s'
  await new Promise(resolve => {
    timer = setInterval(() => {
      if (flag.value) {
        flag.value = false
        clearInterval(timer)
        resolve(null)
      }
    }, 1000)
  })
}

export default useSendFile
