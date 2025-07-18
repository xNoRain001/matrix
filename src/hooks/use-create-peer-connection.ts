import type { Ref } from 'vue'
import type { Socket } from 'socket.io-client'

import useNotify from './use-notify'

let timer = null

// @ts-ignore
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
  socket: Socket,
  roomId: string,
  otherConnected: Ref<boolean>,
  onTrack: (e: RTCTrackEvent) => any
): RTCPeerConnection => {
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
      otherConnected.value = false
      // 关闭网页或点击取消
      // useNotify('对方离开了房间, 如果 30 s 内没有人加入，将返回主页')
      // socket.disconnect()
      // timer = setTimeout(() => {
      //   location.href = '/'
      // }, 30000)
    } else if (iceConnectionState === 'connected') {
      console.log('connected...')
      // useNotify('连接已建立')
      otherConnected.value = true
      clearTimeout(timer)
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
