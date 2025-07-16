import type { Ref } from 'vue'
import type { Socket } from 'socket.io-client'

import useNotify from './use-notify'

let timer = null

// @ts-ignore
const pcConfig = {
  // 免费可用的 STUN 服务器：https://gist.github.com/yetithefoot/7592580
  iceServers: [
    {
      // TURN 服务器地址
      urls: 'turn:numb.viagenie.ca',
      //TURN 服务器用户名
      username: 'webrtc@live.com',
      //TURN 服务器密码
      credential: 'muazkh'
    }
  ],
  // 使用all方式传输数据
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
  // "iceCandidatePoolSize": 0
}

const useCreatePeerConnection = (
  socket: Socket,
  roomId: string,
  otherConnected: Ref<boolean>,
  onTrack: (e: RTCTrackEvent) => any
): RTCPeerConnection => {
  // 创建PeerConnection 对象
  let pc = new RTCPeerConnection()
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
      // 关闭网页或点击取消
      useNotify('对方离开了房间, 如果 30 s 内没有人加入，将返回主页')
      // socket.disconnect()
      timer = setTimeout(() => {
        location.href = '/'
      }, 30000)
    } else if (iceConnectionState === 'connected') {
      console.log('connected...')
      useNotify('连接已建立')
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
