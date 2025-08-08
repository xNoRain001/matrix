import type { Ref } from 'vue'
import type { Socket } from 'socket.io-client'
import { useRoomStore } from '@/store'
import { updateLatestRoom } from '@/apis/latest-room'
import type { remoteRoomInfo } from '@/types'

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
    { urls: 'stun:stun4.l.google.com:19302' }
  ],
  iceTransportPolicy: 'all', // 可选: 'all' | 'relay'
  bundlePolicy: 'max-bundle', // 可选: 'balanced' | 'max-compat' | 'max-bundle'
  rtcpMuxPolicy: 'require', // 可选: 'require'
  iceCandidatePoolSize: 0 // 可选: 0~N，通常为0
}

const useCreatePeerConnection = (
  path: string,
  socket: Socket,
  remoteRoomInfo: remoteRoomInfo,
  online: Ref<boolean>,
  onTrack: (e: RTCTrackEvent) => any
): RTCPeerConnection => {
  const { roomId } = remoteRoomInfo
  // 创建PeerConnection 对象
  let pc = new RTCPeerConnection(pcConfig)
  // 当收到 Candidate 后
  pc.onicecandidate = ({ candidate }) => {
    // 将 Candidate 发送给对端
    socket.emit('rtc', roomId, { candidate })
  }

  // 当 PeerConnection 对象收到远端音视频流时，会触发 ontrack 事件
  pc.ontrack = onTrack

  pc.oniceconnectionstatechange = () => {
    const { iceConnectionState } = pc

    if (iceConnectionState === 'failed') {
      console.log('failed...')
      // pc.restartIce()
    } else if (iceConnectionState === 'disconnected') {
      console.log('disconnected...')
      online.value = false
    } else if (iceConnectionState === 'connected') {
      console.log('connected...')
      online.value = true
      const latestId = useRoomStore().otherInfo.id
      remoteRoomInfo.inRoom = true

      if (!remoteRoomInfo.latestId) {
        remoteRoomInfo.latestId = latestId
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

  return pc
}

export default useCreatePeerConnection
