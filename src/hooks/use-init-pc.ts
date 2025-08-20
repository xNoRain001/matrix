import { io } from 'socket.io-client'
import { ref } from 'vue'
import { useRoomStore, useUserInfoStore } from '@/store'
import { updateLatestRoom } from '@/apis/latest-room'
import type { remoteRoomInfo, userInfo } from '@/types'
import { storeToRefs } from 'pinia'
import useRefreshRoomInfo from './use-refresh-room-info'

let ignoreOffer = false
let polite = true
let makingOffer = false
let firstConnectionSuccess = false
let reconnectionAttempts = 0
const maxReconnectionAttempts = 1
const loading = ref(false)
const showOfflineModal = ref(false)
const toast = useToast()
// 由于其他组件需要使用到 pc、socket 和 dataChannel，因此需要是响应式类型
const pc = ref(null)
const socket = ref(null)
const dataChannel = ref(null)
const online = ref(false)
const { remoteRoomInfo, otherInfo, getOnlineWhenReconnection } =
  storeToRefs(useRoomStore())
const { userInfo } = storeToRefs(useUserInfoStore())
const pcConfig: RTCConfiguration = {
  // 直连时，数据不经过 STUN/TURN
  // 只有在无法直连时，数据才会经过 TURN 服务器
  // 服务器测试可用性： https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
  iceServers: [
    // 免费 STUN 服务器
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:106.53.49.148:3478' },
    // TURN 服务器配置
    {
      urls: 'turn:106.53.49.148:3478',
      username: 'test',
      credential: 'test123'
    }
  ],
  iceTransportPolicy: 'all', // 可选: 'all' | 'relay'
  bundlePolicy: 'max-bundle', // 可选: 'balanced' | 'max-compat' | 'max-bundle'
  rtcpMuxPolicy: 'require', // 可选: 'require'
  iceCandidatePoolSize: 0 // 可选: 0~N，通常为0
}

export const sharedVars = () => ({
  online,
  pc,
  socket,
  dataChannel,
  showOfflineModal,
  loading
})

const initDataChannel = onDataChannel => {
  const _pc = pc.value
  _pc.ondatachannel = onDataChannel
  const _dataChannel = (dataChannel.value =
    _pc.createDataChannel('fileTransfer'))

  _dataChannel.bufferedAmountLowThreshold = 65536
  _dataChannel.onopen = () => {
    console.log('数据通道已打开')
  }
  _dataChannel.onclose = () => {
    console.log('数据通道已关闭')
  }
  _dataChannel.onerror = () => {
    console.log('数据通道错误')
  }
}

const createPeerConnection = (
  tmpRoomId: string,
  path: string,
  onTrack: (e: RTCTrackEvent) => any
) => {
  const _remoteRoomInfo = remoteRoomInfo.value
  const { roomId } = _remoteRoomInfo
  // 创建PeerConnection 对象
  const _pc = (pc.value = new RTCPeerConnection(pcConfig))
  // 当收到 Candidate 后
  _pc.onicecandidate = ({ candidate }) => {
    if (candidate?.candidate?.includes('typ srflx')) {
      console.log('经过 stun 服务器')
    } else if (candidate?.candidate?.includes('typ relay')) {
      console.log('经过 turn 服务器')
    }

    // 将 Candidate 发送给对端
    socket.value.emit('rtc', tmpRoomId || roomId, { candidate })
  }

  // 当 PeerConnection 对象收到远端音视频流时，会触发 ontrack 事件
  if (onTrack) {
    _pc.ontrack = onTrack
  }

  _pc.oniceconnectionstatechange = () => {
    const { iceConnectionState } = _pc

    // 手机切换到其他页面，有可能会触发 failed
    // 如果没有关闭网页，只是切换到其他网页，连接会保持
    if (iceConnectionState === 'failed') {
      console.log('rtc failed...')
      // 重连一直失败，最终状态转为 failed，调用 restartIce 手动重启
      _pc.restartIce()
    } else if (iceConnectionState === 'disconnected') {
      // 自动尝试重连
      console.log('rtc disconnected...')
      online.value = false
    } else if (iceConnectionState === 'connected') {
      console.log('rct connected...')
      online.value = true

      if (tmpRoomId) {
        return
      }

      _remoteRoomInfo.inRoom = true

      if (!_remoteRoomInfo.latestId) {
        const latestId = otherInfo.value.id
        _remoteRoomInfo.latestId = latestId
        updateLatestRoom(path, roomId, latestId)
      }
    }
  }

  // pc.onnegotiationneeded = async () => {
  //   try {
  //     makingOffer = true
  //     await pc.setLocalDescription()
  //     socket.emit('rtc', roomId, { description: pc.localDescription })
  //   } catch (err) {
  //     console.error(err)
  //   } finally {
  //     makingOffer = false
  //   }
  // }
}

const initPC = (
  tmpRoomId: string,
  path,
  onDataChannel,
  onTrack,
  initLocalMediaStream
) => {
  createPeerConnection(tmpRoomId, path, onTrack)

  if (onDataChannel) {
    initDataChannel(onDataChannel)
  } else if (initLocalMediaStream) {
    initLocalMediaStream()
  }
}

const startRTC = async () => {
  const _pc = pc.value
  const offer = await _pc.createOffer()
  await _pc.setLocalDescription(offer)
  socket.value.emit('rtc', remoteRoomInfo.value.roomId, {
    description: offer,
    otherInfo: userInfo.value
  })
}

const closePC = () => {
  const _pc = pc.value
  if (_pc) {
    _pc.close()
  }
}

const onConnect = onBye => {
  // 第一时间发送 join，方便之后获取在线状态
  const _socket = socket.value
  const { roomId } = remoteRoomInfo.value
  _socket.emit('join', roomId)

  if (!firstConnectionSuccess) {
    firstConnectionSuccess = true
  }

  reconnectionAttempts = 0

  // 在模态框内成功连接
  if (showOfflineModal.value) {
    loading.value = false
    showOfflineModal.value = false
    toast.add({ title: '重连成功', color: 'success', icon: 'lucide:smile' })
    // 重新获取房间信息
    useRefreshRoomInfo(socket, roomId, onBye, getOnlineWhenReconnection)
  } else if (getOnlineWhenReconnection.value) {
    _socket.emit('is-online', roomId)
    getOnlineWhenReconnection.value = false
  }
}

const onJoined = async (
  _polite: boolean,
  tmpRoomId: string,
  path,
  onDataChannel,
  onTrack,
  initLocalMediaStream
) => {
  polite = _polite

  // 如果你是后面加入的，在这里初始化 pc
  if (!polite) {
    initPC(tmpRoomId, path, onDataChannel, onTrack, initLocalMediaStream)
    // 初始化完成后通知对方发起连接
    socket.value.emit('otherjoin', remoteRoomInfo.value.roomId)
  }
}

const onOtherJoin = async (
  tmpRoomId: string,
  path,
  onDataChannel,
  onTrack,
  initLocalMediaStream
) => {
  polite = true
  closePC()
  initPC(tmpRoomId, path, onDataChannel, onTrack, initLocalMediaStream)

  try {
    makingOffer = true
    await startRTC()
  } catch (err) {
    console.error(err)
  } finally {
    makingOffer = false
  }
}

const onDisconnect = () => {
  // 当断开连接时，房间会自动清除该 socket
  console.log('socket 断开连接')
  // 满员的情况下，不会触发 joined，此时 pc 为 null
  closePC()
}

const onRtc: (
  _: string,
  data: {
    description?: RTCSessionDescriptionInit
    candidate?: RTCIceCandidate
    otherInfo?: userInfo
  }
) => void = async (_, { description, candidate, otherInfo: _otherInfo }) => {
  const _pc = pc.value

  if (description) {
    const { type } = description
    const offerCollision =
      type === 'offer' && (makingOffer || _pc.signalingState !== 'stable')
    ignoreOffer = !polite && offerCollision

    if (ignoreOffer) {
      return
    }

    // 更新对方的信息
    otherInfo.value = _otherInfo

    try {
      await _pc.setRemoteDescription(description)

      if (type === 'offer') {
        await _pc.setLocalDescription()
        socket.value.emit('rtc', remoteRoomInfo.value.roomId, {
          description: _pc.localDescription,
          otherInfo: userInfo.value
        })
      }
    } catch (error) {
      console.error(error)
    }
  } else if (candidate) {
    try {
      await _pc.addIceCandidate(candidate)
    } catch (err) {
      if (!ignoreOffer) {
        console.error(err)
      }
    }
  }
}

const onConnectError = () => {
  reconnectionAttempts++

  if (showOfflineModal.value) {
    // 模态框打开时，首次连接可能失败，失败后会再进行重试，
    // 因此 reconnectionAttempts 的最大值为 maxReconnectionAttempts + 1
    if (
      reconnectionAttempts ===
      (firstConnectionSuccess
        ? maxReconnectionAttempts
        : maxReconnectionAttempts + 1)
    ) {
      toast.add({
        title: '重连失败，请检查网络后重试',
        color: 'error',
        icon: 'lucide:annoyed'
      })
      // 在断网模态框中的重连失败，取消 loading 状态，让用户再次点击
      loading.value = false
      firstConnectionSuccess = false
      // 同时需要重置尝试次数
      reconnectionAttempts = 0
    }
  } else if (
    reconnectionAttempts ===
    (firstConnectionSuccess
      ? maxReconnectionAttempts
      : maxReconnectionAttempts + 1)
  ) {
    // 首次连接可能失败，如果失败，
    // reconnectionAttempts 的最大值为 maxReconnectionAttempts + 1
    // 如果成功连接后断开，重连时 reconnectionAttempts 的最大值为
    // maxReconnectionAttempts

    // 当模态框未打开时，重试次数满了就打开模态框
    showOfflineModal.value = true
    // 同时需要重置尝试次数
    reconnectionAttempts = 0
    firstConnectionSuccess = false
  }
}

// const onLeaved = () => {}

const useInitPC = async ({
  tmpRoomId,
  path,
  onBye,
  onDataChannel,
  onTrack,
  extraDisconnectAction,
  initLocalMediaStream
}: {
  tmpRoomId?: string
  path?: string
  onBye: (...args: any[]) => void
  onTrack?: (...args: any[]) => void
  onDataChannel?: (...args: any[]) => void
  extraDisconnectAction?: (...args: any[]) => void
  initLocalMediaStream?: (...args: any[]) => void
}) => {
  const _socket = (socket.value = io(import.meta.env.VITE_SOCKET_BASE_URL, {
    reconnectionAttempts: maxReconnectionAttempts
  }))

  _socket.on('connect', () => onConnect(onBye))
  // 自己成功加入房间
  _socket.on('joined', (_, __, polite) =>
    onJoined(
      polite,
      tmpRoomId,
      path,
      onDataChannel,
      onTrack,
      initLocalMediaStream
    )
  )
  // 其他人加入房间
  _socket.on('otherjoin', () =>
    onOtherJoin(tmpRoomId, path, onDataChannel, onTrack, initLocalMediaStream)
  )
  // 自己离开房间
  // _socket.on('leaved', onLeaved)
  // 连接成功后，断开连接，不会触发，只会在最开始建立连接失败时或者重连失败时触发
  _socket.on('connect_error', onConnectError)
  // 连接断开
  _socket.on('disconnect', () => {
    onDisconnect()
    extraDisconnectAction && extraDisconnectAction()
  })
  _socket.on('rtc', onRtc)
  // 其他人离开房间
  _socket.on('bye', onBye)
}

export default useInitPC
