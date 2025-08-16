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
    if (candidate?.candidate?.includes('typ srflx')) {
      console.log('经过 stun 服务器')
    } else if (candidate?.candidate?.includes('typ relay')) {
      console.log('经过 turn 服务器')
    }

    // 将 Candidate 发送给对端
    socket.emit('rtc', roomId, { candidate })
  }

  // 当 PeerConnection 对象收到远端音视频流时，会触发 ontrack 事件
  pc.ontrack = onTrack

  pc.oniceconnectionstatechange = () => {
    const { iceConnectionState } = pc

    // 手机切换到其他页面，有可能会触发 failed
    // 如果没有关闭网页，只是切换到其他网页，连接会保持
    if (iceConnectionState === 'failed') {
      console.log('rtc failed...')
      // 重连一直失败，最终状态转为 failed，调用 restartIce 手动重启
      pc.restartIce()
    } else if (iceConnectionState === 'disconnected') {
      // 自动尝试重连
      console.log('rtc disconnected...')
      online.value = false
    } else if (iceConnectionState === 'connected') {
      console.log('rct connected...')
      online.value = true
      remoteRoomInfo.inRoom = true

      if (!remoteRoomInfo.latestId) {
        const latestId = useRoomStore().otherInfo.id
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
