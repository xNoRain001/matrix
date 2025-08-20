import { receiving } from '@/const'

const onFileMetadata = async (
  socket,
  remoteRoomInfo,
  receiveStartTime,
  receivedFiles,
  data
) => {
  receiveStartTime.value = Date.now()
  const o = { ...data }
  o.status = receiving
  o.formatSize = (data.size / 1024 / 1024).toFixed(2) + 'MB'
  o.progress = 0
  o.time = '0 s'
  // o.speed = '0 MB/s'
  receivedFiles.value.push(o)
  socket.emit('receive-file-metadata', remoteRoomInfo.value.roomId, null)
}

const onReceiveFileMetadata = flag => (flag.value = true)

const onSavedFile = flag => (flag.value = true)

const useExtendFile = (
  socket,
  remoteRoomInfo,
  flag,
  receiveStartTime,
  receivedFiles
) => {
  const _socket = socket.value

  _socket.on('file-metadata', (_, data) =>
    onFileMetadata(
      _socket,
      remoteRoomInfo,
      receiveStartTime,
      receivedFiles,
      data
    )
  )
  _socket.on('receive-file-metadata', () => onReceiveFileMetadata(flag))
  _socket.on('saved-file', () => onSavedFile(flag))
}

export default useExtendFile
